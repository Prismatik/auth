var promisify = require('promisify-node');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var request = require('request-promise');
var server = require('root/lib/server');
var test = require('./tape');

const path = 'http://localhost:' + process.env.PORT;
const opts = {
  url: path + '/verify-token',
  method: 'POST'
};

function ignite(description, cb) {
  test(description, (t) => {
    server.start().then(serv => {
      cb(t).then(() => server.end());
    });
  });
}

ignite('verifying token must respond 404 Not Found if token missing', (t) => {
  return request(_.assign(opts, {json: {}}))
    .catch(e => {
      t.equal(e.statusCode, 404, 'HTTP status code is correct');
      t.equal(e.error, 'Missing token.', 'respond missing token error');
      t.end();
    });
});

ignite('verifying token must respond 400 Bad Request if token invalid signature', (t) => {
  var token = jwt.sign({}, 'nope');

  return request(_.assign(opts, {json: {token: token}}))
    .catch(e => {
      t.equal(e.statusCode, 400, 'HTTP status code is correct');
      t.equal(e.error, 'invalid signature', 'respond invalid signature error');
      t.end();
    });
});

ignite('verifying token must respond 400 Bad Request if token expired', (t) => {
  var attr = {expiresInSeconds: 1};
  var token = jwt.sign({}, process.env.JWT_SECRET, attr);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request(_.assign(opts, {json: {token: token}}))
        .catch(e => {
          t.equal(e.statusCode, 400, 'HTTP status code is correct');
          t.equal(e.error, 'jwt expired', 'respond jwt expired error');
          t.end();
          return resolve();
        });
    }, 1100);
  });
});

ignite('verifying token must respond 404 Not Found if token email does not exist', (t) => {
  var token = jwt.sign({}, process.env.JWT_SECRET);

  return request(_.assign(opts, {json: {token: token}}))
    .catch(e => {
      t.equal(e.statusCode, 404, 'HTTP status code is correct');
      t.equal(e.error, 'Missing email.', 'respond missing email error');
      t.end();
    });
});
