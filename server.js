require('dotenv').config({path:'./config/config.env'});
const express = require('express');

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const fileUpload = require('express-fileupload');
const path = require('path');
const bootcamp =require("./routes/bootcamps");
const courses = require("./routes/courses");
const users = require("./routes/users");
const auth = require('./routes/auth');
const reviews = require('./routes/reviews');

const colors = require('colors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
//Load env vars
const PORT =   process.env.PORT|| 5000;
const DEVELOPMENT = process.env.NODE_ENV;

const connectDB = require("./config/db");


connectDB();


const app = express();



// body parser
app.use(express.json());

app.use(helmet());

app.use(xss());

app.use(cors());
const limiter= rateLimit({
    windowMs:10*60*1000,
    max:100
});
app.use(limiter);


app.use(hpp());

app.use(mongoSanitize());
// cooky parser
app.use(cookieParser());

// fileupload
app.use(fileUpload());

// dev login middle ware
const morgan = require('morgan');


const { connect } = require('mongoose');

if(process.env.NODE_ENV=="development"){
    app.use(morgan('dev'));
}


app.use("/api/v1/bootcamps",bootcamp);

app.use("/api/v1/courses",courses);
app.use("/api/v1/auth",auth);
app.use("/api/v1/users",users);
app.use("/api/v1/reviews",reviews);

app.use(errorHandler);


const server =app.listen(PORT,()=>{
    console.log(`server running in ${DEVELOPMENT} , Listening on port ${PORT}`.yellow.bold);
});

//set static folder
app.use(express.static(path.join(__dirname,'public')));

// unhandled rejections

process.on('unhandledRejection',(err,promise)=>{
    console.log(`unhandled exception:${err.message}`.red.bold) ;
    // close server
    server.close(()=>{
        process.exit(1);
    });
});

