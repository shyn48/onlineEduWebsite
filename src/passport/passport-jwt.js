const passport = require('passport');
const passportJWT = require('passport-jwt');
const User = require('src/models/user');

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy

passport.use('jwt', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromExtractors([
        ExtractJWT.fromUrlQueryParameter('api_token')
    ]),
    secretOrKey: '12345'
}, async (jwtPayload, done) => {
    try {
        let user = await User.findById(jwtPayload.id);

        if (user) done(null, user)
        else done(null, false, { message: 'Not authenticated' })

    } catch (error) {
        done(null, false, { message: error.message })
    }
}));
