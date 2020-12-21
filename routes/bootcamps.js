const express=  require('express');
const router = express.Router();
const {createBootcamp,deleteBootcamp,getSingleBootcamp,uploadPhoto,getBootcampsInRadius,getBootcamps,updateeBootcamp} = require("../controllers/bootcamps");
const advancedResults = require('../middleware/adnvancedResults');
const Bootcamp = require('../modules/Bootcamp');
const {protect,authorize} = require('../middleware/auth');


router.route('/')
.get(advancedResults(Bootcamp),getBootcamps)
.post(protect,authorize('publisher','admin'),createBootcamp);

router.route("/:id")
.get(getSingleBootcamp)
.put(protect,authorize('publisher','admin'),updateeBootcamp)
.delete(protect,authorize('publisher','admin'),deleteBootcamp);

router.route("/radius/:zipcode/:distance")
.get(getBootcampsInRadius);

router.route("/:bootcampId/photo").put(protect,authorize('publisher','admin'),uploadPhoto);
// include other resource router
const courseRouter = require('./courses');
const reviewsRouter = require('./reviews');

// re rotue into auther resource router

router.use("/:bootcampId/courses",courseRouter);
router.use("/:bootcampId/reviews",reviewsRouter);
module.exports=router;