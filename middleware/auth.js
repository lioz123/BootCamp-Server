const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../modules/User');
const AsyncHandler = require('./async');

// protect routes

exports.protect=AsyncHandler(async (req,res,next)=>{
    let token;
    console.log("cookies:".yellow,req.cookies);
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
   } else if(req.cookies.token){
       
         token = req.cookies.token;
     }
    if(!token){
        return next(new ErrorResponse("unauthorized",401));
    }

    
    try{
        //verfy token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        console.log("setting user as:",user);
        req.user=user;
        next();
    }catch(err){
        return next(new ErrorResponse("unauthorized",401));
    }
});


// Grant access to a specific roles
exports.authorize = (...roles)=>{
    return AsyncHandler(async (req,res,next)=>{
        console.log("authorization function called".yellow,roles,req.user.role)
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse(`user role is:${req.user.role} is not authorized to access this route`,403));
        }
        next();
    });
}

