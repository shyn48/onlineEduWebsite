const controller = require('src/http/controllers/controller');
const validator = require('validator');
const Role = require('src/models/role');
const Permission = require('src/models/permission');

class roleController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let roles = await Role.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 20 }
      );
      res.render('admin/roles/index', {
        title: 'سطوح دسترسی',
        roles,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res) {
    let permissions = await Permission.find({});
    res.render('admin/roles/create', { permissions });
  }

  async store(req, res, next) {
    try {
      let status = await this.validateData(req, res);
      if (!status) {
        return this.back(req, res);
      }

      let newRole = await Role({
        name: req.body.name,
        label: req.body.label,
        permissions: req.body.permissions,
      });
      await newRole.save();

      return res.redirect('/admin/users/roles');
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
      let role = await Role.findById(req.params.id);
      if (role.name === req.body.name && role.label === req.body.label)
        return res.redirect('/admin/users/roles');
    }

    let role = await Role.findOne({ name: req.body.name });

    if (role && req.body.label === role.label) {
      validationResult.push('چنین نقشی با این عنوان در سایت ثبت شده است');
    }

    if (!req.body.permissions) {
      validationResult.push('فیلد اجازه نمی تواند خالی بماند');
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
      let role = await Role.findById(req.params.id);
      if (!role) this.error('چنین سطحی وجود ندارد', 404);

      role.remove();

      return res.redirect('/admin/users/roles');
    } catch (e) {
      next(e);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let role = await Role.findById(req.params.id);
      let permissions = await Permission.find({});
      if (!role) {
        this.error('چنین نقشی وجود ندارد', 404);
      }

      return res.render('admin/roles/edit', { permissions, role });
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

      await Role.findByIdAndUpdate(req.params.id, {
        $set: {
          name: req.body.name,
          label: req.body.label,
          permissions: req.body.permissions,
        },
      });

      return res.redirect('/admin/users/roles');
    } catch (error) {
      next(error);
    }
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9A-Z]|-)+/g, '-');
  }
}

module.exports = new roleController();
