const controller = require('../controller');
const validator = require('validator');
const passport = require('passport');

class registerController extends controller {
  showRegisterForm = (req, res) => {
    res.render('home/auth/register.ejs', {
      recaptcha: this.recaptcha.render(),
      title: 'صفحه عضویت',
    });
  };

  registerProcess = async (req, res, next) => {
    await this.validateRecaptcha(req, res);

    let result = this.validateData(req);

    if (result) {
      return this.register(req, res, next);
    }
    return this.back(req, res);
    //old way
    // this.validateRecaptcha(req, res)
    //   .then((result) => {
    //     if (this.validateData(req)) {
    //       return this.register(req, res, next);
    //     } else {
    //       console.log(formData);
    //       req.flash('formData', formData);
    //       return res.redirect('/auth/register');
    //     }
    //   })
    //   .catch((err) => console.log(err));
  };

  validateData(req) {
    let validationResult = [];

    if (validator.isEmpty(req.body.name)) {
      validationResult.push('فیلد نام نمی‌تواند خالی باشد');
    }

    if (!validator.isLength(req.body.name, { min: 5, max: undefined })) {
      validationResult.push('فیلد نام نمی‌تواند کمتر از 5 کلمه باشد');
    }

    if (!validator.isEmail(req.body.email)) {
      validationResult.push('لطفا ایمیلی معتبر وارد کنید');
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

  register(req, res, next) {
    passport.authenticate('local.register', {
      successRedirect: '/',
      failureRedirect: '/auth/register',
      failureFlash: true,
    })(req, res, next);
  }
}

module.exports = new registerController();
