var test = require('./tape');
var server = require('root/lib/server');

test('server must start', (t) => {
  server.start(5000).then(serv => {
    t.ok(serv.address(), 'serv.address() exists');
    t.equal(serv.address().port, 5000, 'port matches');
    server.end().then(() => t.end());
  });
});

test('server must throw error if ending without starting', (t) => {
  server.end().catch(e => {
    t.equal(e.message, server.NOT_STARTED, 'display not started error');
    t.end();
  });
});

test('server must end', (t) => {
  server.start().then(() => {
    server.end().then(serv => {
      t.equal(serv, null, 'server is null');
      t.end();
    });
  });
});
