const ErrorResponse = require('../utils/errorResponse');
const User=  require('../modules/User');
const AsyncHandler = require('../middleware/async');


//@desc get all users
//@route GET /api/v1/users
//@access Private/Admin
exports.getUsers= AsyncHandler(async (req,res,next)=>{
    res.status(200).json(res.advancedResults);
});


//@desc get user
//@route GET /api/v1/users/:userId
//@access Private/Admin
exports.getUser= AsyncHandler(async (req,res,next)=>{
    const user =await  User.findById(req.params.userId);
    if(!user){
        return next(new ErrorResponse("Not such user",404));
    }


    res.status(200).json({success:true,data:user});
});

//@desc create user
//@route POST /api/v1/users
//@access Private/Admin
exports.createUser= AsyncHandler(async (req,res,next)=>{
    await User.create(req.body);
    res.status(201).json({success:true,data:user});
});


//@desc update user
//@route PUT /api/v1/users/userId
//@access Private/Admin
exports.updateUser= AsyncHandler(async (req,res,next)=>{
    const user =await User.findByIdAndUpdate(req.params.userId,req.body,{new:true,runValidators:true});
    res.status(200).json({success:true,data:user});
});


//@desc delete user
//@route DELETE /api/v1/users/userId
//@access Private/Admin
exports.deleteUser= AsyncHandler(async (req,res,next)=>{
    await User.findByIdAndDelete(req.params.userId);
    res.status(201).json({success:true,data:{}});
});

