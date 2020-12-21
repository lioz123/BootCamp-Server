const {createUser,getUser,getUsers,deleteUser,updateUser}=require('../controllers/user');
const advnacedResults= require('../middleware/adnvancedResults');

const {authorize,protect}= require('../middleware/auth');
const User= require('../modules/User');
const express = require("express");
const advancedResults = require('../middleware/adnvancedResults');
const router = express.Router({mergeParams:true});

router.use(protect);
router.use(authorize('admin'));
router.route("/")
.get(protect,authorize('admin'),advancedResults(User),getUsers)
.post(protect,authorize('admin'),createUser);

router.route("/:userId")
.get(protect,authorize('admin'),getUser)
.delete(protect,authorize('admin'),deleteUser)
.put(protect,authorize('admin'),updateUser);

module.exports= router;


