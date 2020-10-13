const path = require('path');
const moment = require('moment-jalaali');
//const autoBind = require('auto-bind'); not needed since u can use arrow functions and arrow functions don't have 'this'
moment.loadPersian({ usePersianDigits: true });

module.exports = class Helpers {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.formData = req.flash('formData')[0];
  }

  getObjects() {
    return {
      auth: this.auth(),
      viewPath: this.viewPath,
      ...this.getGlobalVaribles(),
      old: this.old,
      date: this.date,
      req: this.req,
    };
  }

  auth() {
    return {
      user: this.req.user,
      check: this.req.isAuthenticated(),
    };
  }

  viewPath(dir) {
    return path.resolve(config.layout.view_dir + '/' + dir);
  }

  getGlobalVaribles() {
    return {
      errors: this.req.flash('errors'),
    };
  }

  date(time) {
    return moment(time);
  }

  old = (field, defaultValue = '') => {
    return this.formData && this.formData.hasOwnProperty(field)
      ? this.formData[field]
      : defaultValue;
  };
};
