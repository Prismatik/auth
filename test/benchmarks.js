var test = require('./tape');
var server = require('root/lib/server');
var request = require('supertest');
var _ = require('lodash');
var entities = require('root/test/fixtures/entities');

const key = process.env.API_KEY;

const rando = () => Math.floor(Math.random() * (1 << 24)).toString(16);

const genEntity = () =>
  _.assign(_.omit(entities[0], 'id'), { emails: [rando() + '@example.com'] }, { password: entities[0].plaintext_password });

test('BENCH post a single Entity resource', function(t) {
  const name = this.name;

  console.time(name);
  request(server).post('/entities')
  .send(genEntity())
  .auth('test', key)
  .end(function() {
    console.timeEnd(name);
    t.end();
  });
});

test.skip('BENCH post lots of Entity resources', function(t) {
  const name = this.name;
  const num = 1000;

  console.time(name);

  const iterator = (count) => {
    if (count === num) {
      console.timeEnd(name);
      return t.end();
    }
    request(server).post('/entities')
    .send(genEntity())
    .auth('test', key)
    .end(() => {
      count++;
      iterator(count);
    })
  };
  iterator(0);
});

