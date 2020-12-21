const express=  require('express');
const {getCourses,updateCourse: updateCourses,getCourse: getCourseById,deleteCourse,createCourse}  = require('../controllers/courses');
const advancedResults = require('../middleware/adnvancedResults');
const Course = require('../modules/Course');
const router = express.Router({mergeParams:true});
const {protect,authorize} = require("../middleware/auth");
router.route("/")
.get(advancedResults(Course ,
{
    path:'bootcamp',
    select:"name description"
}
), getCourses).post(protect,authorize('publisher','admin'),createCourse);

router.route("/:courseId").put(protect,authorize('publisher','admin'),updateCourses).get(getCourseById).delete(protect,authorize('publisher','admin'),deleteCourse);

module.exports=router;