const controller = require('src/http/controllers/controller');
const validator = require('validator');
const Course = require('src/models/course');
const Episode = require('src/models/episode');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

class episodeController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let episodes = await Episode.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 2, populate: 'course' }
      );
      res.render('admin/episodes/index', { title: 'اپیزودها', episodes });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res) {
    let courses = await Course.find({});
    res.render('admin/episodes/create', { courses });
  }

  async store(req, res, next) {
    try {
      let status = await this.validateData(req);
      if (!status) {
        return this.back(req, res);
      }

      //create and save episode to db
      let newEpisode = new Episode({ ...req.body });
      await newEpisode.save();

      this.updateCourseTime(newEpisode.course);

      return res.redirect('/admin/episodes');
    } catch (err) {
      next(err);
    }
  }

  async validateData(req) {
    let validationResult = [];

    let timeRegex = new RegExp(
      /^([0-9][0-9]):([0-5][0-9])|([0-9][0-9]:[0-5][0-9]:[0-5][0-9])$/
    );

    if (validator.isEmpty(req.body.course)) {
      validationResult.push('فیلد دوره مربوطه نمیتواند خالی بماند');
    }

    if (!validator.isLength(req.body.title, { min: 5, max: undefined })) {
      validationResult.push('عنوان نمی‌‌تواند کمتر از 5 کاراکتر باشد');
    }

    if (!req.body.time.match(timeRegex)) {
      validationResult.push('لطفا زمان جلسه را درست وارد کنید');
    }

    if (validator.isEmpty(req.body.type)) {
      validationResult.push('نوع دوره نمی‌تواند خالی بماند');
    }

    if (!validator.isLength(req.body.body, { min: 20, max: undefined })) {
      validationResult.push('متن بدنه نمی‌تواند کمتر از 20 کاراکتر باشد');
    }

    if (validator.isEmpty(req.body.videoUrl)) {
      validationResult.push('لینک دانلود نمی‌تواند خالی بماند');
    }

    if (validator.isEmpty(req.body.number)) {
      validationResult.push('فیلد شماره جلسه نمی‌تواند خالی بماند');
    }

    if (validationResult.length == 0) {
      return true;
    } else {
      req.flash('errors', validationResult);
      return false;
    }
  }

  async validateUpdate(req) {
    let validationResult = [];

    let timeRegex = new RegExp(
      /^([0-9][0-9]):([0-5][0-9])|([0-9][0-9]:[0-5][0-9]:[0-5][0-9])$/
    );

    if (validator.isEmpty(req.body.course)) {
      validationResult.push('فیلد دوره مربوطه نمیتواند خالی بماند');
    }

    if (!validator.isLength(req.body.title, { min: 5, max: undefined })) {
      validationResult.push('عنوان نمی‌‌تواند کمتر از 5 کاراکتر باشد');
    }

    if (!req.body.time.match(timeRegex)) {
      validationResult.push('لطفا زمان جلسه را درست وارد کنید');
    }

    if (validator.isEmpty(req.body.type)) {
      validationResult.push('نوع دوره نمی‌تواند خالی بماند');
    }

    if (!validator.isLength(req.body.body, { min: 20, max: undefined })) {
      validationResult.push('متن بدنه نمی‌تواند کمتر از 20 کاراکتر باشد');
    }

    if (validator.isEmpty(req.body.videoUrl)) {
      validationResult.push('لینک دانلود نمی‌تواند خالی بماند');
    }

    if (validator.isEmpty(req.body.number)) {
      validationResult.push('فیلد شماره جلسه نمی‌تواند خالی بماند');
    }

    if (validationResult.length == 0) {
      return true;
    } else {
      req.flash('errors', validationResult);
      return false;
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let episode = await Episode.findById(req.params.id);
      if (!episode) {
        this.error('چنین دوره ای وجود ندارد', 404);
      }

      let courseId = episode.course;

      //delete episode itself
      episode.remove();

      this.updateCourseTime(courseId);

      return res.redirect('/admin/episodes');
    } catch (e) {
      next(e);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let episode = await Episode.findById(req.params.id);
      let courses = await Course.find({});
      if (!episode) {
        this.error('چنین ویدیو ای وجود ندارد', 404);
      }

      return res.render('admin/episodes/edit', { episode, courses });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      let status = await this.validateUpdate(req);
      if (!status) {
        return this.back(req, res);
      }

      let episode = await Episode.findByIdAndUpdate(req.params.id, {
        $set: { ...req.body },
      });

      this.updateCourseTime(episode.course);
      this.updateCourseTime(req.body.course);

      //update that episode's course time

      return res.redirect('/admin/episodes');
    } catch (error) {
      next(error);
    }
  }

  async updateCourseTime(courseId) {
    let course = await Course.findById(courseId).populate('episodes').exec();
    course.set({ time: this.getTime(course.episodes) });
    await course.save();
  }
}

module.exports = new episodeController();
