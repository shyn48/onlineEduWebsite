const express = require('express');
const router = express.Router();

const CourseController = require('src/http/controllers/api/v1/courseController')

router.get('/courses', CourseController.courses)
router.get('/courses/:course', CourseController.singleCourse)

module.exports = router;
