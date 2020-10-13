require('app-module-path').addPath(__dirname);
const App = require('./src');
global.config = require('./config');

new App();
