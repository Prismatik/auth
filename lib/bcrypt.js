var bluebird = require('bluebird');
var bcrypt = bluebird.promisifyAll(require('bcrypt'));

module.exports = bcrypt;
