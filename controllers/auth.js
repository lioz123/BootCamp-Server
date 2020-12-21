const ErrorResponse = require('../utils/errorResponse');
const User=  require('../modules/User');
const AsyncHandler = require('../middleware/async');
const sendEmail = require("../utils/sendEmail");
//@desc Register user
//@route POST /api/v1/auth/register
//@access Public
exports.register= AsyncHandler(async (req,res,next)=>{
        const {email,password,role,name} = req.body;
        const user =await User.create({email,password,role,name});
        if(!user){
            return next(new ErrorResponse("user did not created",404));
        }
        sendTokenResponse(user,200,res);
});

exports.login = AsyncHandler(async (req,res,next)=>{
    const {email,password}= req.body;
    // validated email, password
    if(!email||!password){
        return next(new ErrorResponse("Please provide and email and password",400));
    }
    // check for user
    const user= await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorResponse("Invalid credentials",401));
    }

    
    const isMatch = await user.matchPasswords(password);
    console.log(`is match at login:${isMatch}`);
    if(!isMatch){
        return next(new ErrorResponse("Invalid credentials",401));
    }
    sendTokenResponse(user,200,res);
    
});

// get token from model create cookie and send responds
const sendTokenResponse = (user,status,res)=>{
    const token = user.getSignedJwtToken();
    const expires = new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000);
    const created = new Date(Date.now());

    const options = {
        expires,
        created,
        httpOnly:true,
    }
    if(process.env.NODE_ENV=='production'){
        options.secure=true;
    }
    res.status(status).cookie('token',token,options).json({success:true,token});

}

//@desc Get current user
//@route GET /api/v1/auth/me
//@access private

exports.getMe = AsyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user.id);
    if(!user){
        return next(new ErrorResponse("unauthorized request",401));
    }
    return res.status(200).json({success:true,data:user});
});

//@desc Log User Out/Clear Cookie
//@route GET /api/v1/auth/logout
//@access Private

exports.logout = AsyncHandler(async(req,res,next)=>{
    res.cookie("token","none",{
        expires:new Date(Date.now()+10*1000),
        httpOnly:true
    })
    return res.status(200).json({success:true,data:{}});
});



//@desc Forgot password
//@route POST /api/v1/auth/forgotpassword
//@access public

exports.forgotPassword = AsyncHandler(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorResponse("there is not such email",404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    console.log("resetToken".yellow,resetToken);
    
    const resetUrl =`${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message =`You recieving this email because you (or someone else)
     has requested a reset password, if this email have been sent by you please click on the link below to reset your ${resetUrl}`;

    try{
        await sendEmail({
            subject:"rest password",
            message,
            email:user.email
        });
        res.status(200).json({success:true,data:"email sent"});

    }catch(e){
        console.log("reset password failed",e);
        user.resetPasswordToken = undefined;
        user.resetPassowrdExpired= undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorResponse("Reset password failed",500))
    }
});

exports.confirmResetPassword = AsyncHandler(async (req,res,next)=>{
    const resetPasswordToken= User.getHashedToken(req.params.token);
    const user  =await User.findOne({
        resetPasswordToken,
        resetPassowrdExpired:{$gt:Date.now()}
    });
    console.log(user);
    if(!user){
        return next(new ErrorResponse("This token is not avaiable",404));
    }
    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPassowrdExpired=undefined;
    user.save({validateBeforeSave:false});
    res.status(200).json({success:true,data:"your password have been changed"})

});


//@desc update user detail
//@route PUT /api/v1/auth/updateDetails
//@access private/admin

exports.updateDetails = AsyncHandler(async(req,res,next)=>{
    const {email,name}= req.body;
    const filedsToUpdate={
        email,name
    }
    const user = await User.findByIdAndUpdate(req.user.id,filedsToUpdate,{new:true,runValidators:true});
    if(!user){
        return next(new ErrorResponse("unauthorized request",401));
    }
    return res.status(200).json({success:true,data:user});
});


//@desc update user password
//@route PUT /api/v1/auth/updatePassword
//@access private/admin

exports.updatePassword = AsyncHandler(async(req,res,next)=>{
    const {currentPassword,neoPassword}= req.body;
   
    const user = await User.findById(req.user.id).select('+password');
    
    if(!user){
        return next(new ErrorResponse("unauthorized request",401));
    }
    if(! await user.matchPasswords(currentPassword)){
        return next(new ErrorResponse("password is incorrec",401));
    }
    console.log("neo password is:"+neoPassword);
    user.password=neoPassword;
    await user.save();
    sendTokenResponse(user,200,res);
    
});

