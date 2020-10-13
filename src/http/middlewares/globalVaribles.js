const middleware = require('./middleware');

class globalVaribles extends middleware {
  handle(req, res, next) {
    res.locals = {
      errors: req.flash('errors'),
    };
    next();
  }
}

module.exports = new globalVaribles();
