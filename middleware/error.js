const ErrorResponse = require('../utils/errorResponse');
const errorHanlder = (err,req,res,next)=>{

    let  error = {...err,message:err.message};

    // log console for def

        console.log("Error is:".red.inverse , error);
       
       // badId handling
  

       if(err.name=="CastError"){ // cast error
        console.log("cast err is called");
        error = new  ErrorResponse(`Recourse not found `,404);    
       } else if(err.code==11000){ // duplicated key
        error = new  ErrorResponse(`Duplicated field entered`,400);    
       }else if(err.name=="ValidationError"){
           const message = Object.values(err.errors).map(val => val.message);
           error = new ErrorResponse(message,400);
       }

     

       res.status(error.statusCode || 500).json({
        success:false,
        error:error.message.toString() || "server error"
       });
}

module.exports=errorHanlder;