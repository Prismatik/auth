var config = require('root/config/index.json');
require('required_env')(config.env);
var server = require('root/lib/server');
var setup = require('./setup');

setup().then(() => {
  server.listen(process.env.PORT, () => {
    if (process.env.NODE_ENV != 'test')
      console.log('%s listening at %s', server.name, server.url);
  });
});
