const controller = require('src/http/controllers/controller');
const validator = require('validator');
const User = require('src/models/user');
const Role = require('src/models/role');

class UserController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let users = await User.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 20 }
      );
      res.render('admin/users/index', { title: 'کاربران سایت', users });
    } catch (error) {
      next(error);
    }
  }

  addRole = async (req, res, next) => {
    try {
      this.isMongoId(req.params.id);

      let user = await User.findById(req.params.id);
      let roles = await Role.find({});
      if (!user) this.error('چنین کاربری وجود ندارد', 404);

      res.render('admin/users/addrole', { user, roles });
    } catch (error) {
      next(error);
    }
  };

  storeRole = async (req, res, next) => {
    try {
      this.isMongoId(req.params.id);

      let user = await User.findById(req.params.id);
      if (!user) this.error('چنین کاربری وجود ندارد', 404);

      user.set({ roles: req.body.roles });
      await user.save();

      res.redirect('/admin/users');
    } catch (error) {
      next(error);
    }
  };

  async create(req, res) {
    let categories = await User.find({ parent: null });
    res.render('admin/categories/create', { categories });
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let user = await User.findById(req.params.id)
        .populate({ path: 'courses', populate: ['episodes'] })
        .exec();
      if (!user) {
        this.error('چنین کاربری وجود ندارد', 404);
      }

      user.courses.forEach((course) => {
        courses.episodes.forEach((episode) => episode.remove());
        course.remove();
      });

      //delete User itself
      user.remove();

      return res.redirect('/admin/users');
    } catch (e) {
      next(e);
    }
  }

  async toggleAdmin(req, res) {
    try {
      this.isMongoId(req.params.id);

      let user = await User.findById(req.params.id);
      user.set({ admin: !user.admin });
      await user.save();

      return this.back(req, res);
    } catch (error) {
      next(error);
    }
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9A-Z]|-)+/g, '-');
  }
}

module.exports = new UserController();
