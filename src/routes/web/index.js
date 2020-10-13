const express = require('express');
const router = express.Router();

//middlewares

const redirectIfAuthenticated = require('src/http/middlewares/redirectIfAuthenticated');
const redirectIfNotAdmin = require('src/http/middlewares/redirectIfNotAdmin');
const errorHandler = require('src/http/middlewares/errorHandler');

//admin routers
const adminRouter = require('./admin');
router.use('/admin', redirectIfNotAdmin.handle, adminRouter);

//home routers
const homeRouter = require('./home');
router.use('/', homeRouter);

//auth routers
const authRouter = require('./auth');
router.use('/auth', redirectIfAuthenticated.handle, authRouter);

//error routers
router.all('*', errorHandler.error404);
router.use(errorHandler.handler);

module.exports = router;
