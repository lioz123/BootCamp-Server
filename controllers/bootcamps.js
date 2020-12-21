const Bootcamp = require('../modules/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const AsyncHandler = require('../middleware/async');
const path = require('path');
const geocoder = require('../utils/geocoder');
const {filterOne} = require('../utils/FilterQueries');
const Course = require('../modules/Course');
// @desc = get a single boot camp
// @route = GET api/v1/bootcmaps:id
// @acess = public
exports.getSingleBootcamp= AsyncHandler(async (req,res,next)=>{
        const bootcamp= await  Bootcamp.findById(req.params.id);
        if(!bootcamp){
         return next(new ErrorResponse("un registered id",404));
        }
        //,count:bootcamps.length
        res.status(201).json({success:true,data:bootcamp});

});


// @desc = get a all bootcamps
// @route = GET api/v1/bootcmaps:id
// @acess = public
exports.getBootcamps=  AsyncHandler(async(req,res,next)=>{


        //,count:bootcamps.length
        res.status(200).json(res.advancedResults);
   
});



// @desc = get bootcamps within redius
// @route = GET api/v1/bootcmaps/:zipcode/:distance
// @acess = public
exports.getBootcampsInRadius= AsyncHandler( async(req,res,next)=>{
    console.log('get bootcamps in raduis was called'.yellow);

        const {zipcode,distance} = req.params;
        const loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude;
        const long = loc[0].longitude;
        console.log(`point is:${[long,lat]}`.yellow);
        //Clac radius using radians
        // Calc the reduis of earth
        // earth radius is 3963 miles
        const earthRadius = 3963;
        const radius = distance/earthRadius;
        const bootcamps =await Bootcamp.find({
            location:{
                $geoWithin: {
                    $centerSphere: [[long,lat],radius]
                 }
            }
        });
        res.status(200).json({success:true,bootcamps,count:bootcamps.length});
   
   

});


// @desc = create a single boot camp
// @route = PUT api/v1/bootcmaps:id/
// @acess = private
exports.createBootcamp=  AsyncHandler(async(req,res,next)=>{
    
        //add user to req.body
        req.body.user=req.user.id;
        console.log(`user is:`.yellow,req.user);
        //check for published bootcamps
        
        const publishedBootcamp = await Bootcamp.findOne({user:req.user.id});
        // if user not admin they can only add one bootcamp
        if(publishedBootcamp&&req.user.role!='admin'){
            return next(new ErrorResponse(`The user with id:${req.user.id} has already published a bootcamp`,400));
        }

        const bootcamp= await  Bootcamp.create(req.body);
        res.status(201).json({success:true,data:bootcamp});

 
});


// @desc = uploading bootcamp photo
// @route = Put api/v1/bootcmaps:id/photo
// @acess = private
exports.uploadPhoto=  AsyncHandler(async(req,res,next)=>{
    console.log(`id:${req.params.bootcampId}`);
    const {bootcampId} = req.params;
    const bootcamp= await  Bootcamp.findById(bootcampId);

    if(!bootcamp){
        console.log("unargestered id".red.inverse,bootcamp);
        return next(new ErrorResponse("un registered id",404));
    }

    if(!req.files){
        return next(new ErrorResponse("please upload a file",400));
    }
    const {file} = req.files;
    console.log("file:".blue,file);
    if(!file.mimetype.startsWith("image")){
        return next(new ErrorResponse("please upload an image file",400));
    }

    if(file.size>process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`please add image with a size less than:${process.env.MAX_FILE_UPLOAD}`,400));
    }
    //create custom file name

    file.name= `photo_${bootcampId}${path.parse(file.name).ext}`;
    const filePath =`${process.env.FILE_UPLOAD_PATH}${file.name}`;

    console.log(`path:${filePath}`.yellow);
    file.mv(`${filePath}`,async err=>{
    if(err){
        console.log("there is a problem with saving photo".red.inverse,err);
        return next(err);
    }


    if(!checkAuthorizedBootcampOwner(req.user.id,bootcampId)&&req.user.role!='admin'){
        return next(new ErrorResponse("UnAuthorized",401));
    }


    await Bootcamp.findByIdAndUpdate(bootcampId,{photo:file.name});
    });
    console.log(`file name:${file.name}`);
    res.status(201).json({success:true,data:file.name});

});

// @desc = update a single boot camp
// @route = PUT api/v1/bootcmaps:id
// @acess = private
exports.updateeBootcamp= AsyncHandler( async(req,res,next)=>{
    console.log(`update called:${req.params.id}, body:${JSON.stringify(req.body)}`.yellow,req.user);
    console.log()
        const bootcamp= await  Bootcamp.findById(req.params.id);
   
        if(!checkAuthorizedBootcampOwner(req.user.id,bootcamp)&&req.user.role!='admin'){
            return next(new ErrorResponse("UnAuthorized",401));
        }
        await bootcamp.update(req.body,{new:true, runValidators:true});
        res.status(200).json({success:true,data:bootcamp});

});

// check authorized bootcamp owner

const checkAuthorizedBootcampOwner = (userId,bootcamp)=>userId==bootcamp.user.toString();



// @desc = delete a single boot camp
// @route = DELETE api/v1/bootcmaps:id
// @acess = private
exports.deleteBootcamp=  AsyncHandler(async(req,res,next)=>{
    console.log(`update called:${req.params.id}, body:${JSON.stringify(req.body)}`.yellow);
 
        const bootcamp= await  Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new ErrorResponse("un registered id",404));
        }
        if(!checkAuthorizedBootcampOwner(req.user.id,bootcamp)&&req.user.role!='admin'){
            return next(new ErrorResponse("UnAuthorized",401));
        }
        await bootcamp.remove();
        res.status(200).json({success:true,data:{}});

});
