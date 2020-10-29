const autoBind = require('auto-bind');
const config = require('../../../../config');


module.exports = class controller {
  constructor() {
    autoBind(this)
  }
};
