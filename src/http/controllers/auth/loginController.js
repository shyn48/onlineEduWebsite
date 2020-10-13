const controller = require('../controller');
const validator = require('validator');
const passport = require('passport');

class loginController extends controller {
  showLoginForm = (req, res) => {
    res.render('home/auth/login.ejs', {
      recaptcha: this.recaptcha.render(),
      title: 'صفحه ورود',
    });
  };

  loginProcess = (req, res, next) => {
    this.validateRecaptcha(req, res)
      .then((result) => {
        if (this.validateData(req)) {
          this.login(req, res, next);
        } else {
          res.redirect('/auth/login');
        }
      })
      .catch((err) => console.log(err));
  };

  validateData(req) {
    let validationResult = [];

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

  login(req, res, next) {
    passport.authenticate('local.login', (err, user) => {
      if (!user) return res.redirect('/auth/login');

      req.login(user, (err) => {
        if (req.body.remember) {
          //set token
          user.setRememberToken(res);
        }

        return res.redirect('/');
      });
    })(req, res, next);
  }
}

module.exports = new loginController();
