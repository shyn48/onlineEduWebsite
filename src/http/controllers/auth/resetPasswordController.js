const controller = require('../controller');
const validator = require('validator');
const uniqueString = require('unique-string');
const passport = require('passport');
const PasswordReset = require('src/models/password-reset');
const User = require('src/models/user');

class ResetPasswordController extends controller {
  showResetPassword = (req, res) => {
    res.render('home/auth/passwords/reset', {
      recaptcha: this.recaptcha.render(),
      title: 'بازیابی رمز عبور',
      token: req.params.token,
    });
  };

  resetPasswordProcess = async (req, res, next) => {
    await this.validateRecaptcha(req, res);
    if (this.validateData(req)) {
      return this.resetPassword(req, res);
    } else {
      req.flash('formData', req.body);
      res.redirect('/auth/password/reset/' + req.body.token);
    }
  };

  validateData(req) {
    let validationResult = [];

    if (!validator.isEmail(req.body.email)) {
      validationResult.push('لطفا ایمیلی معتبر وارد کنید');
    }

    if (validator.isEmpty(req.body.token)) {
      validationResult.push('فیلد توکن الزامی است');
    }

    if (!validator.isLength(req.body.password, { min: 8, max: undefined })) {
      validationResult.push(' پسورد نمی‌تواند کمتر از 8 کاراکتر باشد');
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

    const newPasswordReset = new PasswordReset({
      email: req.body.email,
      token: uniqueString(),
    });

    await newPasswordReset.save();

    // req.flash('success', 'ایمیل بازیابی رمز عبور ارسال شد');
    res.redirect('/');
  }

  async resetPassword(req, res) {
    let field = await PasswordReset.findOne({
      $and: [{ email: req.body.email }, { token: req.body.token }],
    });

    if (!field) {
      req.flash('errors', 'اطلاعات وارد شده صحیح نیست لطفا دقت کنید');
      return this.back(req, res);
    }

    if (field.use) {
      req.flash(
        'errors',
        'از این لینک برای بازیابی پسورد قبلا استفاده شده است'
      );
      return this.back(req, res);
    }

    let user = await User.findOne({ email: field.email });

    if (!user) {
      req.flash('errors', 'آپدیت شدن انجام نشد');
      return this.back();
    }
    user.password = req.body.password;
    user.save();
    await field.updateOne({ use: true });
    return res.redirect('/auth/login');
  }
}

module.exports = new ResetPasswordController();
