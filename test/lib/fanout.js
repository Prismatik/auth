var _ = require('lodash');
var test = require('tape');
var tapSpec = require('tap-spec');
var fanout = require('root/lib/fanout');

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

const operation = {
  action: 'add',
  type: 'permission',
  entity: '01234567-89ab-cdef-0123-456789abcde',
  data: 'owner'
};

test('fanout.find returns error if input incorrect format', (t) => {
  fanout.find('nope').catch(e => {
    t.ok(e, 'error if incorrect format');
    t.end();
  });
});

test('fanout.find returns error if input missing type', (t) => {
  var input = _.assign({}, operation, {type: null});
  fanout.find(_.pick(input, _.identity)).catch(e => {
    t.ok(e, 'error if type missing');
    t.end();
  });
});

test('fanout.find returns error if type incorrect value', (t) => {
  var input = _.assign({}, operation, {type: 'nope'});
  fanout.find(input).catch(e => {
    t.ok(e, 'error if type is incorrect value');
    t.end();
  });
});

test('fanout.find returns error if input missing entity', (t) => {
  var input = _.assign({}, operation, {entity: null});
  fanout.find(_.pick(input, _.identity)).catch(e => {
    t.ok(e, 'error if entity missing');
    t.end();
  });
});

test('fanout.find returns error if entity incorrect value', (t) => {
  var input = _.assign({}, operation, {entity: '123'});
  fanout.find(input).catch(e => {
    t.ok(e, 'error if incorrect value');
    t.end();
  });
});

test('fanout.find returns error if input missing data', (t) => {
  var input = _.assign({}, operation, {data: null});
  fanout.find(_.pick(input, _.identity)).catch(e => {
    t.ok(e, 'error if data missing');
    t.end();
  });
});
