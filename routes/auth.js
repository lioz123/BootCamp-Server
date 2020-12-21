const express = require('express');
const {register,logout, login,getMe,updatePassword,forgotPassword,confirmResetPassword: resetPassword,updateDetails} = require('../controllers/auth');
const {protect} = require('../middleware/auth');
const { route } = require('./courses');
const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(protect,getMe);
router.route("/updateDetail").put(protect,updateDetails);

router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:token").put(resetPassword);
router.route("/updatePassword").put(protect,updatePassword); 
router.route("/logout").get(protect,logout);
module.exports = router;