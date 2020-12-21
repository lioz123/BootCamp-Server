const express=  require('express');
const {createReview,updateReview,getReview,getReviews,deleteReview}  = require('../controllers/review');
const advancedResults = require('../middleware/adnvancedResults');
const Review = require('../modules/Review');
const router = express.Router({mergeParams:true});
const {protect,authorize} = require("../middleware/auth");
router.route("/")
.get(advancedResults(Review ,
{
    path:'bootcamp',
    select:"name description"
}
),getReviews)
.post(protect,authorize("admin","user"),createReview);


router.route("/:id")
.get(getReview)
.put(protect,authorize('user','admin'),updateReview)
.delete(protect,authorize('user','admin'),deleteReview);
module.exports=router;