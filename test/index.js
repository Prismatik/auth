var fs = require('fs');
var path = require('path');

files = fs.readdirSync('./test').filter(function(file) {
  if (file === 'index.js') return false;
  if (file === 'fixtures') return false;
  if (file.indexOf('swp') > -1) return false;
  return file.indexOf('.js');
}).forEach(function(file) {
  require(path.resolve('./test/'+file));
});
