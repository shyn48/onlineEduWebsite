const controller = require('src/http/controllers/api/controller');
const passport = require('passport')
const jwt = require('jsonwebtoken')

class HomeController extends controller {

    async user(req, res) {
        res.json(req.user)
    }

}

module.exports = new HomeController();