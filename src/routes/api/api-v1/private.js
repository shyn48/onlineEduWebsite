const express = require('express');
const router = express.Router();

const HomeController = require('src/http/controllers/api/v1/homeController')

router.get('/user', HomeController.user)

module.exports = router;
