const express = require('express');
const passport = require('passport');
const router = express.Router();

const loginController = require('src/http/controllers/auth/loginController');
const registerController = require('src/http/controllers/auth/registerController');
const forgotPasswordController = require('src/http/controllers/auth/forgotPasswordController');
const resetPasswordController = require('src/http/controllers/auth/resetPasswordController');

router.get('/login', loginController.showLoginForm);
router.post('/login', loginController.loginProcess);

router.get('/register', registerController.showRegisterForm);
router.post('/register', registerController.registerProcess);

router.get('/password/reset', forgotPasswordController.showForgotPasswordForm);
router.post('/password/email', forgotPasswordController.sendPasswordResetLink);

router.get('/password/reset/:token', resetPasswordController.showResetPassword);
router.post('/password/reset/', resetPasswordController.resetPasswordProcess);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/register',
  })
);
module.exports = router;
