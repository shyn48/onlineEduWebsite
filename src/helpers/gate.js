let ConnectRoles = require('connect-roles');
const Permission = require('src/models/permission');

let gate = new ConnectRoles({
  failureHandler: function (req, res, action) {
    let accept = req.headers.accept || '';
    res.locals.layout = 'errors/master';
    res.status(403);
    if (accept.indexOf('html')) {
      res.render('errors/403', { action });
    } else {
      res.json("Access Denied - you don't have permission to:" + action);
    }
  },
});

const permissions = async () => {
  return await Permission.find({}).populate('roles').exec();
};

permissions().then((permissions) => {
  permissions.forEach((permission) => {
    let roles = permission.roles.map((role) => role._id);
    gate.use(permission.name, (req) => {
      return req.isAuthenticated() ? req.user.hasRole(roles) : false;
    });
  });
});

module.exports = gate;
