const controller = require('./controller');
const Course = require('src/models/course');
const Comment = require('src/models/comment');
const validator = require('validator');
const Payment = require('src/models/payment');

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
}

module.exports = new userController();
