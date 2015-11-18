var test = require('tape');
var tapSpec = require('tap-spec');
const r = require('root/lib/r');
const setup = require('root/setup');

process.env.NODE_ENV = 'test';
process.env.PORT = 3010;
process.env.JWT_SECRET = 's3cr3t';

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

test('database', (t) => {
  setup()
  .then(() => t.end())
});

module.exports = test;
