const socket=io("localhost:3000/")


let activeConv='conv0';

window.onload = function () {
	// fetchTokken()
	getDoctors()
	// fetchPatients()
// showConversations()
}

//fethcing user from cookies
function fetchTokken(){
token = document.cookie.split('token=')[1]
    let url = '/auth/me';
    let h = new Headers();
    h.append('Authorization', 'Bearer ' + token)

    let req = new Request(url, {
      method: 'GET',
      mode: 'cors',
      headers: h
    });

    fetch(req).then(res => res.json()).then(response => {
      const {
        data
      } = response;
	  console.log(data)
	  localStorage.setItem('userId',data._id) 
	  if(data.role == "undefined"){
		// fetchPatients() 
		getDoctors()	
	}
	else{
		getDoctors()
	}	  
    }).catch(err => console.log(err.message))


}

//fetch all patients from DB
function fetchPatients(){
	const list=JSON.parse (localStorage.getItem('patientsList')) 
if(list == 'undefined' ||list == null){	
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };
  
fetch("http://localhost:3000/doctor/get-patients", requestOptions)
    .then(response => response.json())
    .then(result => {

		console.log(result)
		localStorage.setItem('patientsList',JSON.stringify(result) );
	})
    .catch(error => console.log('error', error));
}
showConversations()
}




// fetching Doctors from Db
function getDoctors(){
const list=JSON.parse (localStorage.getItem('doctorsList')) 
if(list == 'undefined' ||list == null){	
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };
  
fetch("http://localhost:3000/doctor/info", requestOptions)
    .then(response => response.json())
    .then(result => {
		localStorage.setItem('doctorsList',JSON.stringify(result) );
	})
    .catch(error => console.log('error', error));
}
	
		showDoctorsList();
	

}


//show all doctors to patient
function showDoctorsList() {
	let el=document.getElementById("contactList")
	el.innerHTML=""

	let docData=JSON.parse(localStorage.getItem("doctorsList"))
	let uid=localStorage.getItem("userId")
	

	for(i=0;i<docData.data.length;i++) {
		let recId=docData.data[i]._id	
		let uName=docData.data[i].name
		console.log(docData.data[i]._id)
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	
	var raw = JSON.stringify({"senderId":uid,"receiverId":docData.data[i]._id});
	var requestOptions = {
	  method: 'POST',
	  headers: myHeaders,
	  body: raw,
	  redirect: 'follow'
	};
	
	fetch("http://localhost:3000/conversation", requestOptions)
	  .then(response => response.json())
	  .then(result => {
	
		var requestOptions = {
			method: 'GET',
			redirect: 'follow'
		  };
		  
		  fetch(`http://localhost:3000/conversation/find/${uid}/${recId}`, requestOptions)
			.then(response => response.json())
			.then(temp =>{ 
				
				
				console.log(temp)
	
				el.innerHTML +=`<li class="contact" id=${(temp=='undefined'?result._id:temp._id)} onclick="fetchMessages(this.id)">
				<div class="wrap">
					<span class="contact-status"></span>
					<img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />
					<div class="meta">
						<p class="name">${uName}</p>
						<p class="preview"></p>
					</div>
				</div>
				</li>    `
			
			})
			.catch(error => console.log('error', error));
	

	
	})
	  .catch(error => console.log('error', error));
	}


}




function showConversations(){

 let uid=localStorage.getItem("userId")

console.log(uid)
	var requestOptions = {
		method: 'GET',
		redirect: 'follow'
	  };
	  
	  fetch(`http://localhost:3000/conversation/${uid}`, requestOptions)
		.then(response => response.json())
		.then(result =>{ 
			
			
		
			let el=document.getElementById("contactList")
			el.innerHTML=""
	
			console.log(result)
			let value=JSON.parse(localStorage.getItem('patientsList'))
			console.log(value.data)
			for(i=0;i<result.length;i++){
				for(j=0;j<value.data.length;j++){
				if(value.data[j]._id==result[i].members[0]){
					el.innerHTML +=`<li class="contact" id=${result[i]._id} onclick="fetchMessages(this.id)">
		<div class="wrap">
			<span class="contact-status"></span>
			<img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />
			<div class="meta">
				<p class="name">${value.data[j].name}</p>
				<p class="preview"></p>
			</div>
		</div>
	</li>    `
				}
			}
		}
		
		
		})
		.catch(error => console.log('error', error));

}





//fetch conversation messages 
function fetchMessages(id){
	console.log("iam from con")
	localStorage.setItem("currentConv",id)
	//fetch messages from DB
	let uid=localStorage.getItem("userId")
	let el=document.getElementById("messageBox")
	el.innerHTML=""
	var requestOptions = {
		method: 'GET',
		redirect: 'follow'
	  };
	  
	  fetch(`http://localhost:3000/message/${id}`, requestOptions)
		.then(response => response.json())
		.then(result => {
			
			for(i=0;i<result.length;i++){
				console.log(result[i])
				el.innerHTML +=`
				
				<li class=${(result[i].sender==uid? "replies":"sent")}>
					<p>${result[i].text}</p>
				</li>`
			}
		
		})
		.catch(error => console.log('error', error));

}

function newMessage(){
	let convId=localStorage.getItem("currentConv")
	let uid=localStorage.getItem("userId")
	let text=document.getElementById("formData").value

	var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({"conversationId":convId,"sender":uid,"text":text});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("http://localhost:3000/message/", requestOptions)
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
	
}
/////////New Code From Socket





function arrivalMessage  () {
	socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });


}