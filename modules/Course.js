const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

const CourseScmeme = new mongoose.Schema({
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
        required:[true,"please add name"],
        type:String
    },

    description:{
        required:[true,"please add description"],
        type:String
    },
    weeks:{
        required:[true,"please add number of weeks"],

        type:Number,
    
    },
    tuition:{
        required:[true,"please add number of weeks"],
        type:Number,
    },
    minimumSkill:{
        required:[true,"please add minimum skill"],
        type:String,
        enum:["beginner","intermediate","advanced"],
    },
    scholarShipAviable:{
        type:Boolean,
        default:false
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
//static method to get costs average
CourseScmeme.statics.getAverageCost = async function(bootcampId){
console.log("calculating average costs".blue);
    const obj =  await this.aggregate([{
        $match:{bootcamp:bootcampId}
    },{
        $group:{
            _id:bootcampId,
            averageCosts:{$avg:"$tuition"}
        }
    }]);
    try{
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId,{averageCost:Math.ceil(obj[0].averageCosts/10)*10});
    }catch(err){

    }
}

// getAverageCosts after save 
CourseScmeme.post("save",function(){
    this.constructor.getAverageCost(this.bootcamp);

});

CourseScmeme.pre("remove",function(){
    this.constructor.getAverageCost(this.bootcamp);
});

module.exports=mongoose.model('Course',CourseScmeme);