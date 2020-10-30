const controller = require('src/http/controllers/api/controller');
const passport = require('passport')
const jwt = require('jsonwebtoken')

class HomeController extends controller {

    async user(req, res) {
        let user = await req.user.populate({ path: 'roles', populate: [{ path: 'permissions' }] }).execPopulate();

        return res.json({
            data: this.filterUserData(user),
            status: 'success'
        })
    }

    filterUserData(user) {
        return {
            id: user.id,
            admin: user.admin,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            vipTime: user.vipTime,
            vipType: user.vipType,
            roles: user.roles.map(role => {
                return {
                    name: role.name,
                    label: role.label,
                    permissions: role.permissions.map(per => {
                        return {
                            name: per.name,
                            label: per.label
                        }
                    })
                }
            })
        }
    }

}

module.exports = new HomeController();