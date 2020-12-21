const Review = require('../modules/Review');
const AsyncHandler = require('../middleware/async');
const Bootcamp = require('../modules/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
// @desc = get all reviews
// @route = GET api/v1/reviews
// @route = GET api/v1/bootcmaps/:bootcampsId/reviews
// @acess = public
exports.getReviews = AsyncHandler(async (req,res,next)=>{
    console.log(`get reviews was called`.yellow,req.params);
    const {bootcampId} = req.params;
    let query;
    if(bootcampId){
        query = Review.find({bootcamp:bootcampId});
        const reviews = await query;
    res.status(200).json({
        status:true,
        count:reviews.length,
        data:reviews,
    });
    }else{
        res.status(200).json(res.advancedResults);
    }

    


});
// get single review
// api/v1/review/:id
// GET
exports.getReview = AsyncHandler(async (req,res,next)=>{
    console.log(`get review by id:${req.params.id}`);
    const review =  await Review.findById(req.params.id).populate({
        path:"bootcamp",
        select:"name description"
    });
    if(!review){
       return next(new ErrorResponse({message:"not such review",statusCode:404}));
    }
    res.status(200).json({success:true,data:review});
});




//@POST
// create new review
// api/v1/reviews
exports.createReview=AsyncHandler(async (req,res,next)=>{
    req.body.user =req.user.id; 
    req.body.bootcamp=req.params.bootcampId;
    console.log(req.params);
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp){
        return next(new ErrorResponse("There is not such bootcamp",404));
    }
    
   const review = await Review.create(req.body);
    res.status(200).json({success:true,data:review});
});

//@PUT
// update  review
// api/v1/reviews/:id
exports.updateReview=AsyncHandler(async (req,res,next)=>{
    req.body.user =req.user.id; 
    let review = await Review.findById(req.params.id);
    if(!review){
        return next(new ErrorResponse(`no review with the id:${req.params.id}`));
    }

    //make sure review belongs to user or user is an admin

    if(review.user.toString()!=req.user.id&&req.user.role!='admin'){
        return next(new ErrorResponse("not authorized to update review",401));
    }

    review =await Review.findByIdAndUpdate(req.params.id,req.body,{runValidators:true,new:true});


    
    res.status(200).json({success:true,data:review});
});


//@DELETE
// Delete  Review
// api/v1/reviews/:id
exports.deleteReview=AsyncHandler(async (req,res,next)=>{
    req.body.user =req.user.id; 
    let review = await Review.findById(req.params.id);
    if(!review){
        return next(new ErrorResponse(`no review with the id:${req.params.id}`));
    }

    //make sure review belongs to user or user is an admin

    if(review.user.toString()!=req.user.id&&req.user.role!='admin'){
        return next(new ErrorResponse("not authorized to update review",401));
    }

    review =await Review.findByIdAndDelete(req.params.id);


    
    res.status(200).json({success:true,data:{}});
});

