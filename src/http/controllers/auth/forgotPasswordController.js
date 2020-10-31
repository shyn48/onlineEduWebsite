const controller = require('../controller');
const validator = require('validator');
const uniqueString = require('unique-string');
const passport = require('passport');
const PasswordReset = require('src/models/password-reset');
const User = require('src/models/user');
const nodemailer = require('nodemailer');

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
      await passwordReset.save();
      let transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        secure: false,
        auth: {
          user: '06f13d3148f237',
          pass: 'ccb3b1bb507daf'
        }
      });

      let mailOptions = {
        from: '"مجله آموزشی شین" <info@shynEduWebsite.ir>',
        to: `${passwordReset.email}`,
        subject: 'ریست پسورد',
        html: `
          <h2>ریست کردن پسورد</h2>
          <p>برای ریست کردن پسورد برروی لینک زیر کلیک کنید</p>
          <a href="${process.env.WEBSITE_URL}/auth/password/reset/${passwordReset.token}">ریست کردن</a>
        `
      };

      transport.sendMail(mailOptions, (err, info) => {
        if (err) return console.log(err)

        console.log('Mail Sent : %s', info.messageId)

        this.alert(req, {
          title: 'دقت کنید',
          message: 'پیام حاوی لینک پسورد به ایمیل شما ارسال شد',
          type: 'success'
        });

        return res.redirect('/');
      })
      return;
    }

    const newPasswordReset = new PasswordReset({
      email: req.body.email,
      token: uniqueString(),
    });

    await newPasswordReset.save();

    let transport = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let mailOptions = {
      from: '"مجله آموزشی شین" <info@shynEduWebsite.ir>',
      to: `${newPasswordReset.email}`,
      subject: 'ریست پسورد',
      html: `
        <h2>ریست کردن پسورد</h2>
        <p>برای ریست کردن پسورد برروی لینک زیر کلیک کنید</p>
        <a href="${process.env.WEBSITE_URL}/auth/password/reset/${newPasswordReset.token}">ریست کردن</a>
      `
    };

    transport.sendMail(mailOptions, (err, info) => {
      if (err) return console.log(err)

      console.log('Mail Sent : %s', info.messageId)

      this.alert(req, {
        title: 'دقت کنید',
        message: 'پیام حاوی لینک پسورد به ایمیل شما ارسال شد',
        type: 'success'
      });

      return res.redirect('/');
    })
  }
}

module.exports = new ForgotPasswordController();
