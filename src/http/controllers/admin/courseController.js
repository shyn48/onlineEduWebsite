const controller = require('src/http/controllers/controller');
const validator = require('validator');
const Course = require('src/models/course');
const Category = require('src/models/category');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

class courseController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let courses = await Course.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 10 }
      );
      res.render('admin/courses/index', { title: 'دوره ها', courses });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res) {
    let categories = await Category.find({});

    res.render('admin/courses/create', { categories });
  }

  async store(req, res, next) {
    try {
      let status = await this.validateData(req);
      if (!status) {
        if (req.file)
          //deleting image from files if validation failed
          fs.unlinkSync(req.file.path);
        return this.back(req, res);
      }

      //get the image file name after being processed by covertFileToField.js and resize it
      let images = this.imageResize(req.file);
      //simple destructure
      let { title, body, type, price, tags } = req.body;
      //create and save course to db
      let newCourse = new Course({
        user: req.user._id,
        title,
        slug: this.slug(title),
        body,
        type,
        price,
        images,
        thumb: images[480],
        tags,
      });
      await newCourse.save();

      return res.redirect('/admin/courses');
    } catch (err) {
      next(err);
    }
  }

  imageResize(image) {
    const imageInfo = path.parse(image.path);

    let addressImages = {};

    addressImages['original'] = this.getImageUrl(
      `${image.destination}/${image.filename}`
    );

    const resize = (size) => {
      let imageName = `${imageInfo.name}-${size}${imageInfo.ext}`;

      addressImages[size] = this.getImageUrl(
        `${image.destination}/${imageName}`
      );

      sharp(image.path)
        .resize(size, null)
        .toFile(`${image.destination}/${imageName}`);
    };

    [1080, 720, 480].map(resize);

    return addressImages;
  }

  getImageUrl(dir) {
    return dir.substring(8);
  }

  async validateData(req) {
    let validationResult = [];

    let course = await Course.findOne({ slug: this.slug(req.body.title) });
    if (course) {
      validationResult.push(
        'چنین دوره ای با این عنوان قبلا در سایت قرار داده شده است'
      );
    }

    let image = req.body.images;

    if (!image) {
      validationResult.push('وارد کردن تصویر الزامی است');
    }

    let fileExt = ['.png', '.jpg', '.jpeg', '.svg'];

    if (image && !fileExt.includes(path.extname(image))) {
      validationResult.push('پسوند فایل اشتباه است');
    }

    if (!validator.isLength(req.body.title, { min: 5, max: undefined })) {
      validationResult.push('عنوان نمی‌‌تواند کمتر از 5 کاراکتر باشد');
    }

    if (validator.isEmpty(req.body.type)) {
      validationResult.push('نوع دوره نمی‌تواند خالی بماند');
    }

    if (!validator.isLength(req.body.body, { min: 20, max: undefined })) {
      validationResult.push('متن بدنه نمی‌تواند کمتر از 20 کاراکتر باشد');
    }

    if (validator.isEmpty(req.body.price)) {
      validationResult.push('قیمت دوره نمی‌تواند خالی بماند');
    }

    if (validator.isEmpty(req.body.tags)) {
      validationResult.push('فیلد تگ نمی‌تواند خالی بماند');
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

    let image = req.body.images;

    let fileExt = ['.png', '.jpg', '.jpeg', '.svg'];

    if (image && !fileExt.includes(path.extname(image))) {
      validationResult.push('پسوند فایل اشتباه است');
    }

    if (!validator.isLength(req.body.title, { min: 5, max: undefined })) {
      validationResult.push('عنوان نمی‌‌تواند کمتر از 5 کاراکتر باشد');
    }

    if (validator.isEmpty(req.body.type)) {
      validationResult.push('نوع دوره نمی‌تواند خالی بماند');
    }

    if (!validator.isLength(req.body.body, { min: 20, max: undefined })) {
      validationResult.push('متن بدنه نمی‌تواند کمتر از 20 کاراکتر باشد');
    }

    if (validator.isEmpty(req.body.price)) {
      validationResult.push('قیمت دوره نمی‌تواند خالی بماند');
    }

    if (validator.isEmpty(req.body.tags)) {
      validationResult.push('فیلد تگ نمی‌تواند خالی بماند');
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
      let course = await Course.findById(req.params.id)
        .populate('episodes')
        .exec();
      if (!course) {
        this.error('چنین دوره ای وجود ندارد', 404);
      }

      //delete its episodes

      course.episodes.forEach((episode) => episode.remove());

      //delete its images

      Object.values(course.images).forEach((image) => {
        fs.unlinkSync('./public' + image);
      });

      //delete course itself
      course.remove();

      return res.redirect('/admin/courses');
    } catch (e) {
      next(e);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let course = await Course.findById(req.params.id);
      if (!course) {
        this.error('چنین دوره ای وجود ندارد', 404);
      }

      req.courseUserId = course.user;
      if (!req.userCan('edit-courses')) {
        this.error('شما اجازه  دسترسی به این صفحه را ندارید', 403);
      }

      let categories = await Category.find({});
      return res.render('admin/courses/edit', { course, categories });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      let status = await this.validateUpdate(req);
      if (!status) {
        if (req.file)
          //deleting image from files if validation failed
          fs.unlinkSync(req.file.path);
        return this.back(req, res);
      }

      let objectForUpdate = {};

      //set image thumbnail

      objectForUpdate.thumb = req.body.imageThumb;

      //check image

      if (req.file) {
        objectForUpdate.images = this.imageResize(req.file);
        objectForUpdate.thumb = objectForUpdate.images[480];
      }

      //fix for when you don't want to update image and the empty html file input would send null to database
      delete req.body.images;

      objectForUpdate.slug = this.slug(req.body.title);

      await Course.findByIdAndUpdate(req.params.id, {
        $set: { ...req.body, ...objectForUpdate },
      });
      return res.redirect('/admin/courses');
    } catch (error) {
      next(error);
    }
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9A-Z]|-)+/g, '-');
  }
}

module.exports = new courseController();
