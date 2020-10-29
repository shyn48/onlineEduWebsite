const express = require('express');
const router = express.Router();

const CourseController = require('src/http/controllers/api/v1/courseController')
const AuthController = require('src/http/controllers/api/v1/authController')

router.get('/courses', CourseController.courses)
router.get('/courses/:course', CourseController.singleCourse)

router.post('/login', AuthController.login)

module.exports = router;
