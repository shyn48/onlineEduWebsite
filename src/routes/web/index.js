const express = require('express');
const router = express.Router();
const i18n = require('i18n');

//middlewares

router.use((req, res, next) => {
  try {
    let lang = req.signedCookies.lang;
    if (i18n.getLocales().includes(lang)) {
      req.setLocale(lang);
    } else {
      req.setLocale(i18n.getLocale());
    }
    next();
  } catch (error) {
    next(error);
  }
});

router.get('/lang/:lang', (req, res) => {
  let lang = req.params.lang;
  if (i18n.getLocales().includes(lang)) {
    res.cookie('lang', lang, {
      maxAge: 1000 * 60 * 60 * 24 * 90,
      signed: true,
    });
  }
  res.redirect(req.header('Referer') || '/');
});

const redirectIfAuthenticated = require('src/http/middlewares/redirectIfAuthenticated');
const redirectIfNotAdmin = require('src/http/middlewares/redirectIfNotAdmin');
const errorHandler = require('src/http/middlewares/errorHandler');

//admin routers
const adminRouter = require('./admin');
router.use('/admin', redirectIfNotAdmin.handle, adminRouter);

//home routers
const homeRouter = require('./home');
router.use('/', homeRouter);

//auth routers
const authRouter = require('./auth');
router.use('/auth', redirectIfAuthenticated.handle, authRouter);

//error routers
router.all('*', errorHandler.error404);
router.use(errorHandler.handler);

module.exports = router;
