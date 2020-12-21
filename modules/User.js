const bycript = require('bcryptjs');
const mongoose = require("mongoose");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const UserScheme = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please add name"]
    },

    email: {
        type: String,
        required:[true,"please add email"],
        unique:true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 
        'Please add a valid email'
        ]
      },

      role:{
          type:String,
          enum:['user','publisher'],
          default:'user'
      },
      password:{
          type:String,
          required:[true,"please add password"],
          minlength:6,
          select:false
      },
      resetPasswordToken:String,
      resetPassowrdExpired:Date,
      createdAt:{
          type:Date,
          default:Date.now
      }
});

UserScheme.pre("save",async function(next){
    if(!this.isModified('password')){
        return next();
    }
const salt = await bycript.genSalt(10);
this.password=  await bycript.hash(this.password,salt);
next();
});
// sign jwt and return
UserScheme.methods.getSignedJwtToken = function(){

       const token= jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES});
       return token;
}
UserScheme.methods.matchPasswords = async function(enteredPassword){
    const isMatch =await bycript.compare(enteredPassword,this.password);
 console.log(`entered password:${enteredPassword}, isMatch:${isMatch}`.yellow);
 return isMatch;
}

UserScheme.methods.getResetPasswordToken=function(){
  const resetToken = crypto.randomBytes(20).toString('hex');
  console.log("reset token:",resetToken);
  
  this.resetPasswordToken = crypto.createHash('sha256')
  .update(resetToken)
  .digest('hex');
  
  this.resetPassowrdExpired= Date.now() +10*60*1000
  return resetToken;
}

UserScheme.statics.getHashedToken=  function(token){
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return hashedToken;
}
module.exports = mongoose.model("User",UserScheme);