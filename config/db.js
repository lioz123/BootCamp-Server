const Mongoose = require('mongoose');


const connectDB = async ()=>{
    const conn = await Mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology:true,
    });

    console.log(`connected to mongodb:${conn.connection.host}`);
}

module.exports = connectDB;
