const controller = require('src/http/controllers/controller');
const validator = require('validator');
const Category = require('src/models/category');

class categoryController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let categories = await Category.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 20, populate: 'parent' }
      );
      res.render('admin/categories/index', { title: 'دسته ها', categories });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res) {
    let categories = await Category.find({ parent: null });
    res.render('admin/categories/create', { categories });
  }

  async store(req, res, next) {
    try {
      let status = await this.validateData(req, res);
      if (!status) {
        return this.back(req, res);
      }

      let newCategory = await Category({
        name: req.body.name,
        parent: req.body.parent !== 'none' ? req.body.parent : null,
        slug: this.slug(req.body.name),
      });
      await newCategory.save();

      return res.redirect('/admin/categories');
    } catch (err) {
      next(err);
    }
  }

  async validateData(req, res) {
    let validationResult = [];

    if (!validator.isLength(req.body.name, { min: 5, max: undefined })) {
      validationResult.push('عنوان نمی‌‌تواند کمتر از 5 کاراکتر باشد');
    }

    if (!req.body.parent) {
      validationResult.push('فیلد پدر دسته نمیتواند خالی بماند');
    }

    if (req.query._method === 'put') {
      let category = await Category.findById(req.params.id);
      console.log(category.name, req.body.name);
      console.log(category.parent, req.body.parent);
      if (
        category.name === req.body.name &&
        (category.parent === req.body.parent ||
          (category.parent === null && req.body.parent === 'none'))
      ) {
        console.log('puttter');
        return res.redirect('/admin/categories');
      }
    }

    let category = await Category.findOne({ slug: this.slug(req.body.name) });

    if (category) {
      validationResult.push('چنین دسته ای با این عنوان در سایت ثبت شده است');
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
      let category = await Category.findById(req.params.id)
        .populate('childs')
        .exec();
      if (!category) {
        this.error('چنین دوره ای وجود ندارد', 404);
      }

      category.childs.forEach((child) => {
        child.remove();
      });

      //delete category itself
      category.remove();

      return res.redirect('/admin/categories');
    } catch (e) {
      next(e);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let category = await Category.findById(req.params.id);
      let categories = await Category.find({ parent: null });
      if (!category) {
        this.error('چنین دسته ای وجود ندارد', 404);
      }

      return res.render('admin/categories/edit', { category, categories });
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

      let category = await Category.findByIdAndUpdate(req.params.id, {
        $set: {
          name: req.body.name,
          parent: req.body.parent !== 'none' ? req.body.parent : null,
          slug: this.slug(req.body.name),
        },
      });

      return res.redirect('/admin/categories');
    } catch (error) {
      next(error);
    }
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9A-Z]|-)+/g, '-');
  }
}

module.exports = new categoryController();
