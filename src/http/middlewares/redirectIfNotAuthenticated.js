const middleware = require('./middleware');

class redirectIfNotAuthenticated extends middleware {
  handle(req, res, next) {
    if (req.isAuthenticated()) return next();

    return res.redirect('/auth/login');
    next();
  }
}

module.exports = new redirectIfNotAuthenticated();
