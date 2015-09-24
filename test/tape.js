var test = require('tape');
var tapSpec = require('tap-spec');

process.env.NODE_ENV = 'test';
process.env.PORT = 3010;
process.env.JWT_SECRET = 's3cr3t';

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

module.exports = test;
