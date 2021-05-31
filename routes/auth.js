const express = require('express');
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
    getUserInfo,
    logout
} = require('../controllers/auth');

const router = express.Router();
const {
    protect
} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updateDetails', updateDetails);
router.put('/updatePassword', updatePassword);
router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resetToken', resetPassword);
router.get('/getInfo', getUserInfo);
router.get('/logout', logout);


module.exports = router;