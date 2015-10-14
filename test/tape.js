var test = require('tape');
var tapSpec = require('tap-spec');
const r = require('root/lib/r');

process.env.NODE_ENV = 'test';
process.env.PORT = 3010;
process.env.JWT_SECRET = 's3cr3t';

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

test('database', (t) => {
  r.dbCreate(process.env.RETHINK_NAME).run()
  .then(() => {
    t.end();
  }).catch((err) => {
    var arr = err.message.split('\n');
    if (arr[0] === 'Database `'+process.env.RETHINK_NAME+'` already exists in:') return t.end();
    t.fail();
  });
});

module.exports = test;
