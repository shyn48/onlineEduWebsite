const controller = require('src/http/controllers/controller');
const validator = require('validator');
const Permission = require('src/models/permission');

class permissionController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let permissions = await Permission.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 20 }
      );
      res.render('admin/permissions/index', {
        title: 'لیست اجازه دسترسی',
        permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res) {
    res.render('admin/permissions/create');
  }

  async store(req, res, next) {
    try {
      let status = await this.validateData(req, res);
      if (!status) {
        return this.back(req, res);
      }

      let newPermission = await Permission({
        name: req.body.name,
        label: req.body.label,
      });
      await newPermission.save();

      return res.redirect('/admin/users/permissions');
    } catch (err) {
      next(err);
    }
  }

  async validateData(req, res) {
    let validationResult = [];

    if (!validator.isLength(req.body.name, { min: 5, max: undefined })) {
      validationResult.push('عنوان نمی‌‌تواند کمتر از 5 کاراکتر باشد');
    }

    if (!req.body.label) {
      validationResult.push('فیلد توضیحات نمیتواند خالی بماند');
    }

    if (req.query._method === 'put') {
      let permission = await Permission.findById(req.params.id);
      if (
        permission.name === req.body.name &&
        permission.label === req.body.label
      )
        return res.redirect('/admin/users/permissions');
    }

    let permission = await Permission.findOne({ name: req.body.name });

    if (permission && permission.name === req.body.name) {
      validationResult.push('چنین اجازه‌ای با این عنوان در سایت ثبت شده است');
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
      let permission = await Permission.findById(req.params.id)
        .populate('childs')
        .exec();
      if (!permission) this.error('چنین اجازه ای وجود ندارد', 404);

      permission.remove();

      return res.redirect('/admin/users/permissions');
    } catch (e) {
      next(e);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let permission = await Permission.findById(req.params.id);
      if (!permission) {
        this.error('چنین اجازه‌ای وجود ندارد', 404);
      }

      return res.render('admin/permissions/edit', { permission });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      let status = await this.validateData(req, res);
      if (res.headersSent) return;
      if (!status) {
        return this.back(req, res);
      }

      await Permission.findByIdAndUpdate(req.params.id, {
        $set: {
          name: req.body.name,
          label: req.body.label,
        },
      });

      return res.redirect('/admin/users/permissions');
    } catch (error) {
      next(error);
    }
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9A-Z]|-)+/g, '-');
  }
}

module.exports = new permissionController();
