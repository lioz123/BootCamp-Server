const fs = require('fs');
const Mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config({path:'./config/config.env'});
const Bootcamp = require('./modules/Bootcamp');
const { dirname } = require('path');
const Course = require('./modules/Course');
const User = require('./modules/User');
const Review = require('./modules/Review');
// loadenv vars 



const connectDB = async ()=>{
    const conn = await Mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology:true,
    });

    console.log(`connected to mongodb:${conn.connection.host}`);
}
connectDB();

// read bootcamps
const bootcamps = JSON.parse( fs.readFileSync(`./_data/bootcamps.json`,'utf-8'));
const courses = JSON.parse( fs.readFileSync(`./_data/courses.json`,'utf-8'));
const users = JSON.parse( fs.readFileSync(`./_data/users.json`,'utf-8'));
const reviews = JSON.parse( fs.readFileSync(`./_data/reviews.json`,'utf-8'));


const ImportData= async ()=>{
    try{
       await(User.create(users));
        await(Bootcamp.create(bootcamps));
        await(Course.create(courses));
        await Review.create(reviews);
        console.log(`added bootcamps successfully`.green);
    }catch(err){
        console.log(`${err.message}`.red);
    }
}

const DeleteData = async ()=>{
    try{
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('deleted all data'.red.inverse);
    }catch(err){
        console.log(`${err.message}`.red);
    }
    return;
}

if(process.argv[2]=='-i'){
    ImportData().then(()=>{
        process.exit(1);
    });;
}else if(process.argv[2]=='-d'){
    DeleteData().then(()=>{
        process.exit(1);
    });;
}else if(process.argv[2]=='-di'){

   DeleteData().then(()=>{
    ImportData().then(()=>{
        process.exit(1);
    });
   });
   
}