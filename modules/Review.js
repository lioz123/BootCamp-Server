const mongoose = require('mongoose');
const { aggregate } = require('./User');

const ReviewScheme = new mongoose.Schema({
    /*
        "title": "Front End Web Development",
    "description": "This course will provide you with all of the essentials to become a successful frontend web developer. You will learn to master HTML, CSS and front end JavaScript, along with tools like Git, VSCode and front end frameworks like Vue",
    "weeks": 8,
    "tuition": 8000,
    "minimumSkill": "beginner",
    "scholarshipsAvailable": true,
    "bootcamp": "5d713995b721c3bb38c1f5d0",
    "user": "5d7a514b5d2c12c7449be045"
    */

    title:{
        required:[true,"please add title for the review"],
        trim:true,
        maxlength:100,
        type:String
    },

    text:{
        required:[true,"please add text"],     
        type:String
    },
    rating:{
        required:[true,"please add a rating between 1 and 10"],
        max:10,
        min:1,
        type:Number,
    
    },
 
    createdAt:{
        type:Date,
        default:Date.now
    },

    bootcamp:{
        type:mongoose.Schema.ObjectId,
        ref:'Bootcamp',
        required:true,

    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
      }

});


ReviewScheme.statics.calculateRating = async function(bootcampId){
    const obj =  await this.aggregate([{
        $match:{bootcamp:bootcampId}
    },{
        $group:{
            _id:"$bootcamp",
            averageRating:{$avg:"$rating"}
        }

    }]);
    try{
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId,{averageRating:obj[0].averageRating});
    }catch(err){
        console.log("error".red.inverse,obj,err);
    }
    console.log("average rating:",obj[0].averageRating);

}


// getAverageCosts after save 
ReviewScheme.post("save",function(){
    this.constructor.calculateRating(this.bootcamp);

});

ReviewScheme.pre("remove",function(){
    this.constructor.calculateRating(this.bootcamp);
});
// prevent user from submiting more than one review per bootcamp
ReviewScheme.index({bootcamp:1,user:1},{unique:true});
module.exports=mongoose.model('Review',ReviewScheme);