const controller = require('src/http/controllers/controller');

class indexController extends controller {
  index(req, res) {
    res.render('admin/index');
  }

  uploadImage(req, res) {
    res.json({
      uploaded: 1,
      filename: req.file.originalName,
      url: `${req.file.destination}/${req.file.filename}`.substring(8),
    });
  }
}

module.exports = new indexController();
