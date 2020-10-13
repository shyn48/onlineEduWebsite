const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('src/models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new googleStrategy(
    {
      clientID: config.service.google.client_key,
      clientSecret: config.service.google.secret_key,
      callbackURL: config.service.google.callbackUrl,
    },
    (token, refreshToken, profile, done) => {
      User.findOne({ email: profile.emails[0].value }, (err, user) => {
        if (err) return done(err);
        if (user) return done(null, user);

        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: profile.id,
        });

        newUser.save((err) => {
          if (err) throw err;
          done(null, newUser);
        });
      });
    }
  )
);
