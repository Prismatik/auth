var db = require('root/lib/r');
var test = require('./tape');

test('drain pool', (t) => {
 db.getPoolMaster().drain()
 .then(() => {
   t.end()
 });
});
