const middleware = require('./middleware');
const passport = require('passport');
const User = require('src/models/user')

class authApi extends middleware {
  handle(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err || !user)
        return res.status(401).json({
          data: info.message || 'not authenticated',
          status: 'error'
        })

      req.user = user;

      next();
    })(req, res, next);
  }
}

module.exports = new authApi();
