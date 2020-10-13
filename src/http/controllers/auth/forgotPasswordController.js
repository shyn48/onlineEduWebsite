const controller = require('../controller');
const validator = require('validator');
const uniqueString = require('unique-string');
const passport = require('passport');
const PasswordReset = require('src/models/password-reset');
const User = require('src/models/user');

class ForgotPasswordController extends controller {
  showForgotPasswordForm = (req, res) => {
    res.render('home/auth/passwords/email', {
      recaptcha: this.recaptcha.render(),
      title: 'فراموشی رمز عبور',
    });
  };

  sendPasswordResetLink = async (req, res, next) => {
    await this.validateRecaptcha(req, res);
    if (this.validateData(req)) {
      this.sendResetLink(req, res);
    } else {
      this.back(req, res);
    }
  };

  validateData(req) {
    let validationResult = [];

    if (!validator.isEmail(req.body.email)) {
      validationResult.push('لطفا ایمیلی معتبر وارد کنید');
    }

    if (validationResult.length == 0) {
      return true;
    } else {
      req.flash('errors', validationResult);
      return false;
    }
  }

  async sendResetLink(req, res) {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash('errors', 'کاربری با این ایمیل وجود ندارد');
      return this.back(req, res);
    }

    let passwordReset = await PasswordReset.findOne({ email: req.body.email });

    if (passwordReset) {
      passwordReset.use = false;
      passwordReset.token = uniqueString();
      passwordReset.save();
      res.redirect('/');
      return;
    }

    const newPasswordReset = new PasswordReset({
      email: req.body.email,
      token: uniqueString(),
    });

    await newPasswordReset.save();

    // req.flash('success', 'ایمیل بازیابی رمز عبور ارسال شد');
    res.redirect('/');
  }
}

module.exports = new ForgotPasswordController();
