const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const validator = require('express-validator');
const session = require('express-session');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const passport = require('passport');
const routers = require('./routes/web');
const apiRouters = require('./routes/api');
const Helpers = require('./helpers');
const rememberLogin = require('src/http/middlewares/rememberLogin');
const gate = require('src/helpers/gate');
const i18n = require('i18n');
const methodOverride = require('method-override');
const helmet = require('helmet');
const csp = require('helmet-csp');
const csurf = require('csurf');
const csurfErrorHandler = require('src/http/middlewares/csurfErrorHandler');
const crypto = require('crypto')

module.exports = class Application {
  constructor() {
    this.setupExpress();
    this.setMongoConnection();
    this.setConfig();
    this.setRouters();
  }

  setMongoConnection() {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.database.url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  }

  setupExpress() {
    const server = http.createServer(app);
    server.listen(config.port, () => {
      console.log(`Listening on port ${config.port}`);
    });
  }

  setConfig() {
    require('src/passport/passport-local.js');
    require('src/passport/passport-google.js');
    require('src/passport/passport-jwt.js');

    app.enable('trust proxy')
    //app.use(helmet())

    // const crypto = require("crypto");

    // app.use((req, res, next) => {
    //   res.locals.nonce = crypto.randomBytes(16).toString("hex");
    //   next();
    // });

    // app.use((req, res, next) => {
    //   csp({
    //     directives: {
    //       defaultSrc: ["'self'"],
    //       scriptSrc: ["'self'", `'nonce-${res.locals.nonce}'`],
    //     },
    //   })(req, res, next);
    // });

    // app.use((req, res) => {
    //   res.end(`<script nonce="${res.locals.nonce}">alert(1 + 1);</script>`);
    // });

    app.use(express.static(config.layout.public_dir));
    app.set('view engine', config.layout.view_engine);
    app.set('views', config.layout.view_dir);
    app.use(expressLayouts);
    app.set('layout extractScripts', true);
    app.set('layout extractStyles', true);
    app.set('layout', 'home/master');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));
    //  app.use(validator());
    app.use(session({ ...config.session }));
    app.use(cookieParser(config.cookie_secretkey));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(rememberLogin.handle);
    app.use(gate.middleware());
    i18n.configure({
      locales: ['en', 'fa'],
      directory: config.layout.locales_dir,
      defaultLocale: 'fa',
      cookie: 'lang',
    });
    app.use(i18n.init);
    app.use((req, res, next) => {
      app.locals = new Helpers(req, res).getObjects();
      next();
    });
  }

  setRouters() {
    app.use(apiRouters);
    app.use(routers)
    // app.use(csurf({ cookie: true }), routers);
    // app.use(csurfErrorHandler.handle);
  }
};
