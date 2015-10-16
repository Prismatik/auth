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
