const controller = require('src/http/controllers/api/controller');
const passport = require('passport')
const jwt = require('jsonwebtoken')

class AuthController extends controller {

    async login(req, res, next) {
        passport.authenticate('local.login', { session: false }, (err, user) => {
            if (err) return res.status(500).json({
                data: err.message,
                status: 'error'
            });

            if (!user) return res.status(404).json({
                data: 'user doesn\'t exist',
                status: 'error'
            })

            req.login(user, { session: false }, (err) => {

                if (err) return res.status(500).json({
                    data: err.message,
                    status: 'error'
                });

                const token = jwt.sign({ id: user._id }, '12345', {
                    expiresIn: 60 * 60 * 24 * 30
                })

                return res.json({
                    data: {
                        token
                    },
                    status: 'success'
                })

            })

        })(req, res);
    }

}

module.exports = new AuthController();