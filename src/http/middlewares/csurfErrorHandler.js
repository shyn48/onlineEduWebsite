class csurfErrorHandler {
  handle(err, req, res, next) {

    if (err.code !== 'EBADCSRFTOKEN') return next(err);

    res.status(403)
    res.send('form tampered with')

  }
}

module.exports = new csurfErrorHandler();
