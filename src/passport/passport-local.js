const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
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
  'local.register',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) return done(err);
        if (user)
          return done(
            null,
            false,
            req.flash('errors', 'چنین کاربری قبلا در سایت ثبت نام کرده است')
          );

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });

        newUser.save((err) => {
          if (err) {
            return done(err, false, req.flash('errors', err));
          }
          done(null, newUser);
        });
      });
    }
  )
);

passport.use(
  'local.login',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) return done(err);

        if (!user || !user.comparePasswords(password)) {
          return done(
            null,
            false,
            req.flash('errors', 'اطلاعات وارد شده مطابقت ندارد')
          );
        }

        done(null, user);
      });
    }
  )
);
