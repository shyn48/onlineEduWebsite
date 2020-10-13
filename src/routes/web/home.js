const express = require('express');
const router = express.Router();

const homeController = require('src/http/controllers/homeController');
const courseController = require('src/http/controllers/courseController');
const userController = require('src/http/controllers/userController');

//middlewares

const redirectIfNotAuthenticated = require('src/http/middlewares/redirectIfNotAuthenticated');

router.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('remember_token');
  res.redirect('/');
});

router.get('/', homeController.index);
router.get('/about', homeController.about);

router.get('/courses', courseController.index);
router.get('/courses/:course', courseController.single);

router.get('/download/:episode', courseController.download);

router.post(
  '/course/payment',
  redirectIfNotAuthenticated.handle,
  courseController.payment
);

router.get(
  '/course/payment/checker',
  redirectIfNotAuthenticated.handle,
  courseController.checker
);

router.post(
  '/comment',
  redirectIfNotAuthenticated.handle,
  homeController.comment
);

router.get('/user/panel', userController.index);
router.get('/user/panel/history', userController.history);

module.exports = router;
