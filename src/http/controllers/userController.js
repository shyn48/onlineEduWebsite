const controller = require('./controller');
const Course = require('src/models/course');
const Comment = require('src/models/comment');
const validator = require('validator');
const Payment = require('src/models/payment');
const soap = require('soap');

class userController extends controller {
  index = async (req, res, next) => {
    try {
      res.render('home/panel/index');
    } catch (error) {
      next(error);
    }
  };
  history = async (req, res, next) => {
    try {
      let page = req.query.page || 1;
      let payments = await Payment.paginate(
        { user: req.user.id },
        { page, sort: { createdAt: -1 }, limit: 20, populate: 'course' }
      );
      res.render('home/panel/history', { title: 'پرداختی ها', payments });
    } catch (error) {
      next(error);
    }
  };

  vip = async (req, res) => {
    res.render('home/panel/vip');
  };

  vipPayment = async (req, res, next) => {
    try {
      let plan = req.body.plan,
        price = 0;

      switch (plan) {
        case '3':
          price = 30000;
          break;
        case '12':
          price = 120000;
          break;
        default:
          false;
          price = 10000;
          break;
      }

      //Buy process using the SOAP protocol

      let args = {
        MerchantID: '00',
        Amount: price,
        CallbackURL: `${process.env.WEBSITE_URL}/user/panel/vip/payment/checker`,
        Description: `بابات افزایش اعتبار ویژه `,
        Email: req.user.email,
      };

      soap.createClient(
        'https://sandbox.zarinpal.com/pg/services/WebGate/wsdl',
        async function (err, client) {
          client.PaymentRequest(args, async function (err, result) {
            if (result.Status == 100) {
              let payment = new Payment({
                user: req.user._id,
                vip: true,
                resnumber: result.Authority,
                price: price,
              });

              await payment.save();

              res.redirect(
                `https://sandbox.zarinpal.com/pg/StartPay/${result.Authority}`
              );
            }
          });
        }
      );
    } catch (error) {
      next(error);
    }
  };

  vipPaymentChecker = async (req, res, next) => {
    try {
      if (req.query.Status && req.query.Status !== 'OK')
        return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'پرداخت شما با موفقیت انجام نشد',
          type: 'info',
        });

      let payment = await Payment.findOne({ resnumber: req.query.Authority })
        .populate('course')
        .exec();

      if (!payment.vip) {
        return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'این تراکنش مربوط به افزایش اعتبار ویژه نیست',
          type: 'error',
        });
      }

      let verificationArgs = {
        MerchantID: '00',
        Authority: req.query.Authority,
        Amount: payment.price,
      };

      soap.createClient(
        'https://sandbox.zarinpal.com/pg/services/WebGate/wsdl',
        async (err, client) => {
          client.PaymentVerification(verificationArgs, async (err, result) => {
            if (err) {
              return this.alertAndBack(req, res, {
                title: 'دقت کنید',
                message: 'پرداخت شما با موفقیت انجام نشد',
                type: 'error',
              });
            }

            if (result.Status == 100) {
              payment.set({ paid: true });

              let time = 0,
                type = '';

              switch (payment.price) {
                case 10000:
                  time = 1;
                  type = 'month';
                  break;

                case 30000:
                  time = 3;
                  type = '3month';
                  break;
                case 120000:
                  time = 12;
                  type = '12month';
                  break;
              }

              if (time == 0) {
                this.alert(req, {
                  title: 'توجه کنید',
                  message: 'عمیلات موردنظر با موفقیت انجام نشد',
                  type: 'error',
                  button: 'بسیار خب',
                });
                return res.redirect('/user/panel/vip');
              }

              let vipTime = req.user.isVip()
                ? new Date(req.user.vipTime)
                : new Date();
              vipTime.setMonth(vipTime.getMonth() + time);

              req.user.set({ vipTime, vipType: type });
              await req.user.save();
              await payment.save();

              this.alert(req, {
                title: 'با تشکر',
                message: 'عمیلات موردنظر با موفقیت انجام شد',
                type: 'success',
                button: 'بسیار خب',
              });
              return res.redirect('/user/panel');
            }

            this.alertAndBack(req, res, {
              title: 'دقت کنید',
              message: 'پرداخت شما با موفقیت انجام نشد',
              type: 'error',
            });
          });
        }
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new userController();
