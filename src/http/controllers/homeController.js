const controller = require('./controller');
const Course = require('src/models/course');
const Comment = require('src/models/comment');
const validator = require('validator');

class homeController extends controller {
  index = async (req, res) => {
    //   console.log(req.getLocale());
    let courses = await Course.find({}).sort({ createdAt: 1 }).limit(8).exec();
    res.render('home/index', { courses });
  };
  about = async (req, res) => {
    res.render('home/about');
  };

  comment = async (req, res, next) => {
    try {
      let status = await this.validateComment(req);

      if (!status) return this.back(req, res);

      let newComment = new Comment({
        user: req.user.id,
        ...req.body,
      });

      await newComment.save();

      return this.back(req, res);
    } catch (error) {
      next(error);
    }
  };

  validateComment(req) {
    let validationResult = [];

    if (!validator.isLength(req.body.comment, { min: 20, max: undefined })) {
      validationResult.push('متن بدنه نمی‌تواند کمتر از 10 کاراکتر باشد');
    }

    if (validationResult.length == 0) {
      return true;
    } else {
      req.flash('errors', validationResult);
      return false;
    }
  }
}

module.exports = new homeController();
