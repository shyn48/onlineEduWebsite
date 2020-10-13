const controller = require('./controller');
const Course = require('src/models/course');
const Episode = require('src/models/episode');
const Category = require('src/models/category');
const Payment = require('src/models/payment');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const axios = require('axios');
const soap = require('soap');

class courseController extends controller {
  index = async (req, res, next) => {
    try {
      let query = {};

      let { search, type, category } = req.query;

      if (req.query.category && req.query.category != 'all') {
        category = await Category.findOne({ slug: category });
        if (category) query.categories = { $in: [category._id] };
      }

      if (search) query.title = new RegExp(search, 'gi');
      if (type && type != 'all') query.type = type;

      let courses = Course.find({ ...query });

      if (req.query.order) courses.sort({ createdAt: -1 });

      courses = await courses.exec();

      let categories = await Category.find({});

      res.render('home/courses', { courses, categories });
    } catch (e) {
      next(e);
    }
  };

  async single(req, res, next) {
    try {
      let course = await Course.findOneAndUpdate(
        { slug: req.params.course },
        { $inc: { viewCount: 1 } }
      )
        .populate([
          {
            path: 'user',
            select: 'name',
          },
          {
            path: 'episodes',
            options: {
              sort: { number: 1 },
            },
          },
        ])
        .populate([
          {
            path: 'comments',
            match: {
              parent: null,
              approved: true,
            },
            populate: [
              {
                path: 'user',
                select: 'name',
              },
              {
                path: 'comments',
                match: {
                  approved: true,
                },
                populate: { path: 'user', select: 'name' },
              },
            ],
          },
        ]);

      let categories = await Category.find({ parent: null })
        .populate('childs')
        .exec();

      if (!course) throw new Error('چنین دوره ای وجود ندارد', 404);

      res.render('home/single-course', { course, categories });
    } catch (e) {
      next(e);
    }
  }

  async download(req, res, next) {
    try {
      this.isMongoId(req.params.episode);

      let episode = await Episode.findById(req.params.episode);

      if (!episode) this.error('چنین فایلی برای این جلسه وجود ندارد', 404);

      if (!this.checkHash(req, episode))
        this.error('اعتبار لینک شما به پایان رسیده است', 403);

      let filePath = path.resolve(`./public/${episode.videoUrl}`);

      if (!fs.existsSync(filePath))
        this.error('چنین فایلی برای دانلود وجود ندارد', 404);

      await episode.inc('downloadCount');

      return res.download(filePath);
    } catch (error) {
      next(error);
    }
  }

  checkHash(req, episode) {
    let timestamps = new Date().getTime();

    if (req.query.t < timestamps) return false;

    let secret = `aQTR@!F#FAHKLGN#*&%*${episode.id}${req.query.t}`;
    return bcrypt.compareSync(secret, req.query.mac);
  }

  async payment(req, res, next) {
    try {
      this.isMongoId(req.body.course);

      let course = await Course.findById(req.body.course);
      if (!course) {
        this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'چنین دوره‌ای یافت نشد',
          type: 'error',
        });
      }

      if (await req.user.checkLearning(course)) {
        this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'شما قبلا در این دوره ثبت نام کردید',
          type: 'error',
          button: 'خیلی خب',
        });
      }

      if (
        course.price == 0 &&
        (course.type == 'vip' || course.type == 'free')
      ) {
        this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message:
            'این دوره مخصوص اعضای ویژه یا رایگان است و قابل خریداری نیست',
          type: 'error',
          button: 'خیلی خب',
        });
      }

      //buying process REST

      // let params = {
      //   MerchantID: '00e',
      //   Amount: course.price,
      //   CallbackURL: 'http://localhost:3000/course/payment/checker',
      //   Description: `بابات خرید دوره ${course.title}`,
      //   Email: req.user.email,
      // };

      // let options = {
      //   method: 'POST',
      //   url: 'https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json',
      //   header: {
      //     'cache-control': 'no-cache',
      //     'content-type': 'application/json',
      //   },

      //   body: params,
      //   json: true,
      // };

      // axios(options)
      //   .then((data) => {
      //     res.redirect(
      //       `https://www.zarinpal.com/pg/StartPay/${data.Authority}`
      //     );
      //   })
      //   .catch((err) => res.json(err));

      //Buy process using the SOAP protocol

      let args = {
        MerchantID: '00',
        Amount: course.price,
        CallbackURL: 'http://localhost:3000/course/payment/checker',
        Description: `بابات خرید دوره ${course.title}`,
        Email: req.user.email,
      };

      soap.createClient(
        'https://sandbox.zarinpal.com/pg/services/WebGate/wsdl',
        async function (err, client) {
          client.PaymentRequest(args, async function (err, result) {
            if (result.Status == 100) {
              let payment = new Payment({
                user: req.user._id,
                course: course.id,
                resnumber: result.Authority,
                price: course.price,
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
  }

  async checker(req, res, next) {
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

      if (!payment.course) {
        return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'دوره ای که شما پرداخت کرده‌اید وجود ندارد',
          type: 'error',
        });
      }

      let verificationArgs = {
        MerchantID: '00',
        Authority: req.query.Authority,
        Amount: payment.course.price,
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
              payment.set({ payment: true });

              req.user.boughtCourses.push(payment.course._id);

              await payment.save();
              await req.user.save();

              this.alert(req, {
                title: 'با تشکر',
                message: 'عمیلات موردنظر با موفقیت انجام شد',
                type: 'success',
                button: 'بسیار خب',
              });
              return res.redirect(payment.course.path());
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
  }
}

module.exports = new courseController();
