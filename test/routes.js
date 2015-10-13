var jwt = require('jsonwebtoken');
var _ = require('lodash');
var request = require('supertest');
var server = require('root/lib/server');
var test = require('./tape');

const key = process.env.API_KEY;
const pass = (t, message) => (error) => {
  if (error) return t.end(error);
  t.pass(message);
  t.end();
};

test('verifying token must respond 404 Not Found if token missing', (t) => {
  request(server)
  .post('/verify-token')
  .auth('test', key)
  .send({})
  .expect(404, {code: 'NotFoundError', message: 'Missing token.'}, pass(t, 'returned 404 not fond'))
});

test('verifying token must respond 400 Bad Request if token invalid signature', (t) => {
  var token = jwt.sign({}, 'nope');

  request(server)
  .post('/verify-token')
  .auth('test', key)
  .send({token: token})
  .expect(400, {code: 'BadRequestError', message: 'invalid signature'}, pass(t, 'respond invalid signature error'));
});

test('verifying token must respond 400 Bad Request if token expired', (t) => {
  var attr = {expiresIn: 1};
  var token = jwt.sign({}, process.env.JWT_SECRET, attr);

  setTimeout(() => {
    request(server)
    .post('/verify-token')
    .auth('test', key)
    .send({token: token})
    .expect(400, {code: 'BadRequestError', message: 'jwt expired'}, pass(t, 'respond jwt expired error'));
  }, 1100);
});

test('verifying token must respond 404 Not Found if token email does not exist', (t) => {
  var token = jwt.sign({}, process.env.JWT_SECRET);

  request(server)
  .post('/verify-token')
  .auth('test', key)
  .send({token: token})
  .expect(404, {code: 'NotFoundError', message: 'Missing email.'}, pass(t, 'respond missing email error'));
});
