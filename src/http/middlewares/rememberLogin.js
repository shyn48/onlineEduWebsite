const middleware = require('./middleware');
const User = require('src/models/user');

class RememberLogin extends middleware {
  handle(req, res, next) {
    if (!req.isAuthenticated()) {
      const rememberToken = req.signedCookies.remember_token;
      if (rememberToken) {
        return this.userFind(req, rememberToken, next);
      }
    }

    next();
  }

  userFind(req, rememberToken, next) {
    User.findOne({ rememberToken })
      .then((user) => {
        if (user) {
          return req.login(user, (err) => {
            if (err) next(err);
            next();
          });
        }
        next();
      })
      .catch((err) => next(err));
  }
}

module.exports = new RememberLogin();
