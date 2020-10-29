const express = require('express');
const router = express.Router();

const publicRoutes = require('./public')
const privateRoutes = require('./private')

router.use(publicRoutes)

module.exports = router;
