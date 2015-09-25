var _ = require('lodash');
var proxyquire = require('proxyquire');
var test = require('./tape');
var entities = require('./fixtures/entities.json');

var fanout = proxyquire('root/lib/fanout', {
  'root/models/entity': {
    get: (id) => {
      return Promise.resolve().then(() => _.find(entities, {id: id}));
    }
  }
});

const id = '015f04df-af79-450c-9c10-08bafc9a1da3';
const operation = {
  action: 'add',
  variety: 'permission',
  type: 'member',
  entity: '7aeaafb2-d194-449c-8fa7-2cc54873ffea',
};

test('fanout.generate returns error if input incorrect format', (t) => {
  fanout.generate(id, 'nope').catch(e => {
    t.ok(e, 'error if incorrect format');
    t.end();
  });
});

test('fanout.generate returns error if input incorrect format', (t) => {
  fanout.generate(id, 'nope').catch(e => {
    t.ok(e, 'error if incorrect format');
    t.end();
  });
});

test('fanout.generate returns error if input missing variety', (t) => {
  var input = _.assign({}, operation, {variety: null});
  fanout.generate(id, _.pick(input, _.identity)).catch(e => {
    t.ok(e, 'error if variety missing');
    t.end();
  });
});

test('fanout.generate returns error if variety incorrect value', (t) => {
  fanout.generate(id, _.assign({}, operation, {variety: 'nope'})).catch(e => {
    t.ok(e, 'error if variety is incorrect value');
    t.end();
  });
});

test('fanout.generate returns error if input missing entity', (t) => {
  var input = _.assign({}, operation, {entity: null});
  fanout.generate(id, _.pick(input, _.identity)).catch(e => {
    t.ok(e, 'error if entity missing');
    t.end();
  });
});

test('fanout.generate returns error if entity incorrect value', (t) => {
  fanout.generate(id, _.assign({}, operation, {entity: '123'})).catch(e => {
    t.equal(e, 'entity must be a valid UUID', 'error if incorrect value');
    t.end();
  });
});

test('fanout.generate returns error if input missing data', (t) => {
  var input = _.assign({}, operation, {type: null});
  fanout.generate(id, _.pick(input, _.identity)).catch(e => {
    t.ok(e, 'error if type missing');
    t.end();
  });
});

test('fanout.generate returns only passed operation if entity has no permissions', (t) => {
  var input = _.assign({}, operation, {entity: '62bb01a7-7af2-467b-935d-fed7953d3a17'});
  fanout.generate(id, input).then(res => {
    t.equal(res.operations.length, 1, 'only one operation returned');
    t.end();
  });
});

test('fanout.generate does not return inherited permissions of another type', (t) => {
  fanout.generate(id, operation).then(res => {
    t.equal(res.operations.length, 2, 'returns two operations');

    var found = res.operations.filter(item => {
      return item.type != operation.type;
    });
    t.notOk(found.length, 'found 0 incorrect types of permissions');
    t.end();
  });
});

test('fanout.generate returns inherited permission of operation.type', (t) => {
  fanout.generate(id, operation).then(res => {
    t.equal(res.operations.length, 2, 'returns two operations');

    var found = res.operations.filter(item => {
      return item.variety == 'inherited_permission';
    });
    t.ok(found.length, 'found inherited permission');
    t.end();
  });
});

test('fanout.generate returns error if circular inheritance found', (t) => {
  var input = _.assign({}, operation, {type: 'owner'});
  fanout.generate(id, input).catch(e => {
    t.ok(e, 'display circular inheritance error');
    t.end();
  });
});
