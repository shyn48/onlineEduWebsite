const express = require('express');
const router = express.Router();

const publicRoutes = require('./public')
const privateRoutes = require('./private');
const authApi = require('../../../http/middlewares/authApi');

router.use(publicRoutes)
router.use(authApi.handle, privateRoutes)

module.exports = router;
