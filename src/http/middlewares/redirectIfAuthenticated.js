const middleware = require('./middleware');

class RedirectIfAuthenticated extends middleware {
  handle(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/');
    next();
  }
}

module.exports = new RedirectIfAuthenticated();
