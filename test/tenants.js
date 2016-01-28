const _ = require('lodash');
const uuid = require('uuid');
const test = require('./tape');
const setup = require('root/setup');
const tenants = require('root/controllers/tenants');

test('tenants should contain the RETHINK_TABLE', (t) => {
  t.ok(_.contains(tenants.tenants, process.env.RETHINK_TABLE));
  t.end();
});

test('tenants should contain all tables', (t) => {
  const tenant = uuid.v4().replace(/-/g, '');
  setup(tenant)
  .then(() => {
    tenants.poll()
    .then(() => {
      t.ok(_.contains(tenants.tenants, tenant));
      t.end();
    });
  });
});
