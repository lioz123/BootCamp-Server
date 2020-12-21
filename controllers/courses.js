const Course = require('../modules/Course');
const AsyncHandler = require('../middleware/async');
const Bootcamp = require('../modules/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');


// @desc = get all coruses
// @route = GET api/v1/courses
// @route = GET api/v1/bootcmaps/:bootcampsId/courses

// @acess = public
exports.getCourses = AsyncHandler(async (req,res,next)=>{
    console.log(`get coruses was called`.yellow,req.params);
    const {bootcampId} = req.params;
    let query;
    if(bootcampId){
        query = Course.find({bootcamp:bootcampId});
        const courses = await query;
    res.status(200).json({
        status:true,
        count:courses.length,
        data:courses,
    });
    }else{
        res.status(200).json(res.advancedResults);
    }

    


});
// get single coruse
// api/v1/coruses/:courseId
// GET
exports.getCourse = AsyncHandler(async (req,res,next)=>{
    console.log(`get course by id:${req.params.courseId}`);
    const course = await Course.findById(req.params.courseId);
    
    if(!course){
       return next(ErrorResonse({message:"not such course",statusCode:404}));
    }

    res.status(200).json({success:true,data:course});
});


//@POST
// create new coruse
// api/v1/bootcamps/:bootcampId/courses
exports.createCourse=AsyncHandler(async (req,res,next)=>{
     req.body.bootcamp = req.params.bootcampId;
     req.body.user =req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp){
        return next(new ErrorResponse("there is not such bootcamp",404));   
    }
    console.log("userId:",req.body.user,bootcamp.user.toString());

    if(req.user.id!=bootcamp.user.toString()&&req.user.role!='admin'){
        return next(new ErrorResponse("UnAuthorized to create a coure",401));
    }

    console.log(`bootcamp id exists:${req.params.bootcampId}`.yellow,bootcamp);
    const course = await Course.create(req.body);
     res.status(200).json({success:true,data:course});
});

////PUT application/json
//update single course
// api/v1/courses/:courseId
exports.updateCourse = AsyncHandler(async(req,res,next)=>{
    console.log(`updating course:`.yellow,req.body);
    const course =await Course.findById(req.params.courseId);
    console.log("course is".yellow,course)
    if(!course){
        return next(new ErrorResonse("no such id",404));
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(req.params.courseId,req.body,{new:true,runValidators:true});
    if(!this.updateCourse){
       return next(new ErrorResonse("no such id",404));
    }
     res.status(200).json({success:true,data:updatedCourse});
});


//@DELETE
// delete course by id
// api/v1/courses/:courseId
exports.deleteCourse = AsyncHandler(async(req,res,next)=>{

    const course =await Course.findById(req.params.courseId);
    console.log("course is".yellow,course)
    if(!course){
        return next(new ErrorResonse("no such id",404));
    }
    
    await course.remove();

    res.status(200).json({success:true,data:course});
});

const checkAuthorizedBootcampOwner = (userId,bootcamp)=>userId==bootcamp.user.toString();
