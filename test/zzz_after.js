var db = require('root/lib/r');
var tenants = require('root/controllers/tenants');
var test = require('./tape');

test('stop tenancy poll', (t) => {
  tenants.stopPolling();
  t.end();
});

test('drain pool', (t) => {
 db.getPoolMaster().drain()
 .then(() => {
   t.end()
 });
});
