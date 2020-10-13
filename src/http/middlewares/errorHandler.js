class errorHandler {
  async error404(req, res, next) {
    try {
      res.status(404);
      throw new Error('چنین صفحه‌ای یافت نشد');
    } catch (e) {
      next(e);
    }
  }

  handler(err, req, res, next) {
    const statusCode = err.status || 500;
    const message = err.message || '';
    const stack = err.stack || '';

    const layouts = {
      layout: 'errors/master',
      extractScripts: false,
      extractStyles: false,
    };

    if (config.debug)
      return res.render('errors/stack', { ...layouts, message, stack });

    return res.render(`errors/${statusCode}`, { ...layouts, message, stack });
  }
}

module.exports = new errorHandler();
