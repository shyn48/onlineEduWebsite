const path = require('path');

const publicDirectoryPath = path.join(__dirname, '../public');

module.exports = {
  public_dir: publicDirectoryPath,
  view_dir: path.resolve('resource/views'),
  view_engine: 'ejs',
};
