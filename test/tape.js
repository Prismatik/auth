var test = require('tape');
var tapSpec = require('tap-spec');

process.env.NODE_ENV = 'test';
process.env.PORT = 3010;

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

module.exports = test;
