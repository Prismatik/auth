'use strict';
var config = require('root/config');
require('required_env')(config.env);
var test = require('./tape');
var server = require('root/lib/server');
var request = require('supertest');
var _ = require('lodash');
var entities = require('root/test/fixtures/entities');
var r = require('root/lib/r');
var jwt = require('jsonwebtoken');
var uuid = require('node-uuid');
var assert = require('assert');

const key = process.env.API_KEY;

const fail = function(t) {
  return function() {
    t.fail();
    t.end();
  }
};

const pass = (t, message) => (err) => {
  if (err) return t.end(err);
  t.pass(message);
  t.end();
}

const rando = () => Math.floor(Math.random() * (1 << 24)).toString(16);

const genEntity = () =>
  _.assign(_.omit(entities[0], 'id'), { emails: [rando() + '@example.com'] }, { password: entities[0].plaintext_password });

// Feel free to split these tests out into files, write additional ones, etc. Change the runner if you like.
// I've written this spec in the mindset of e2e integration tests. ie: stand up a server and throw queries at it with superagent or request or similar. We should also write unit tests for the actual code as we go.

// Note that I haven't given a great deal of thought to PUT vs POST in these tests, so if it makes sense to substitute, test both, etc, just do it.
//
test('it should return 401 to a request with no auth', function(t) {
  request(server)
  .post('/entities')
  .expect(401, pass(t, 'returned 401'))
});

test('it should allow an authorised request to POST an Entity resource', function(t) {
  request(server).post('/entities')
  .send(genEntity())
  .auth('test', key)
  .expect(200, pass(t, 'returned 200'));
});

test('it should use the password_hash field if provided', function(t) {
  var entity = genEntity();
  entity.password_hash = 'foo';
  delete entity.password;

  request(server).post('/entities')
  .send(entity)
  .auth('test', key)
  .expect(200)
  .then(function(res) {
    assert.equal(res.body.password, 'foo');
    pass(t, 'returned 200')();
  });
});

test('it should allow an authorised request to GET an Entity resource after POSTing it', function(t) {
  const entity = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .expect(200)
  .end((err, res) => {
    request(server)
    .get('/entities/' + res.body.id)
    .auth('test', key)
    .expect(res => {
      res.body.rev = entity.rev
      res.body.created_at = entity.created_at
      res.body.updated_at = entity.updated_at
      res.body.password = entity.password
    })
    .expect(200, _.assign({}, entity, {id: res.body.id}), pass(t, 'returned correct entity'));
  });
});

test('it should allow an authorised request to GET an Entity resource after POSTing it with a specified uuid', function(t) {
  let entity = genEntity();
  entity.id = uuid.v4();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .expect(200)
  .end((err, res) => {
    assert.equal(res.body.id, entity.id);
    request(server)
    .get('/entities/' + res.body.id)
    .auth('test', key)
    .expect(res => {
      res.body.rev = entity.rev
      res.body.created_at = entity.created_at
      res.body.updated_at = entity.updated_at
      res.body.password = entity.password
    })
    .expect(200, _.assign({}, entity, {id: res.body.id}), pass(t, 'returned correct entity'));
  });
});

test.skip('it should reject the POST of a malformed Entity resource', function(t) {
  request(server)
  .post('/entities')
  .auth('test', key)
  .send({hai: 'foo'})
  .expect(400, pass(t, 'return 400 error'));
});

test('it should enforce that emails are unique', function(t) {
  const entity = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .expect(200)
  .end(() => {
    request(server)
    .post('/entities')
    .auth('test', key)
    .send(entity)
    .expect(409, pass(t, 'returned 409 error'));
  });
});

test('it should create a token given the correct password for a UID', function(t) {
  // Set up an entity, then POST to /login with the entity's UID and password. It should return a token
  populateEntities(1)
  .then(entities => {
    request(server)
    .post('/login')
    .auth('test', key)
    .send({
      id: entities[0].id,
      password: entities[0].plaintext_password
    })
    .expect(res => {
      t.ok(res.body.token, 'returned a token')
    })
    .expect(200, pass(t, 'returned 200'));
  });
});

test('it should create a token given the correct password and an email', function(t) {
  // Set up an entity, then POST to /login with the entity's email and password. It should return a token
  populateEntities(1)
  .then(entities => {
    request(server)
    .post('/login')
    .auth('test', key)
    .send({
      email: entities[0].emails[0],
      password: entities[0].plaintext_password
    })
    .expect(res => {
      t.ok(res.body.token, 'returned a token')
    })
    .expect(200, pass(t, 'returned 200'));
  });
});

test('it should not create a token given the incorrect password', function(t) {
  populateEntities(1)
  .then(entities => {
    request(server)
    .post('/login')
    .auth('test', key)
    .send({
      id: entities[0].id,
      password: 'wrong'
    })
    .expect(403, { code: 'ForbiddenError', message: 'Invalid password' }, pass(t, 'returned 403 invalid password error'));
  });
});

test('it should not create a token given the incorrect email', function(t) {
  populateEntities(1)
  .then(entities => {
    request(server)
    .post('/login')
    .auth('test', key)
    .send({
      email: 'wat@example.com',
      password: entities[0].plaintext_password
    })
    .expect(403, { code: 'ForbiddenError', message: 'Invalid username' }, pass(t, 'returned 403 invalid username error'));
  });
});

test('it should return the Entity associated with a valid token', function(t) {
  // GET /entities?token=some_jwt should return the Entity you expect it to. To stay RESTful this should be an array that only ever has one element.
  populateEntities(1)
  .then(entities => {
    request(server)
    .post('/login')
    .auth('test', key)
    .send({
      id: entities[0].id,
      password: entities[0].plaintext_password
    })
    .expect(200)
    .end((err, res) => {
      request(server)
      .get('/entities?token=' + res.body.token)
      .auth('test', key)
      .expect(200, [entities[0]], pass(t, 'returned the entity associated with a valid token'));
    });
  });

});

test('it should not return any Entity given an invalid token', function(t) {
  request(server)
  .get('/entities?token=foo')
  .auth('test', key)
  .expect(403, pass(t, 'return 403 forbidden'))
});

test('it should respond 404 for a valid token that contains a non-existent email', (t) => {
  var token = jwt.sign({email: 'foo@example.com'}, process.env.JWT_SECRET);
  request(server)
  .get('/entities?token='+token)
  .auth('test', key)
  .expect(404, pass(t, 'return 404 not found'))
});

test('it should respond 401 Unauthorized if token expired', (t) => {
  var attr = {expiresIn: 1};
  var token = jwt.sign({}, process.env.JWT_SECRET, attr);

  setTimeout(() => {
    request(server)
    .get('/entities?token='+token)
    .auth('test', key)
    .expect(401, pass(t, 'return 401 unauthorized'))
  }, 1100);
});

test('it should respond 403 Forbidden if token invalid signature', (t) => {
  var token = jwt.sign({}, 'nope');

  request(server)
  .get('/entities?token='+token)
  .auth('test', key)
  .expect(403, pass(t, 'return 403 Forbidden'))
});

test('it should return the Entity associated with a valid email', function(t) {
  const entity = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .expect(200)
  .end((err, res) => {
    request(server)
    .get('/entities?email=' + entity.emails[0])
    .auth('test', key)
    .expect(res => {
      res.body[0].rev = entity.rev
      res.body[0].created_at = entity.created_at
      res.body[0].updated_at = entity.updated_at
      res.body[0].password = entity.password
    })
    .expect(200, [_.assign({}, entity, {id: res.body.id})], pass(t, 'returned correct entity'));
  });
});

test('it should not return any Entity given an invalid email', function(t) {
  request(server)
  .get('/entities?email=foobarbaz%40example.com')
  .auth('test', key)
  .expect(200, [], pass(t, 'returned 0 entities'));
});

test('it should return the Entity associated with a valid ID', function(t) {
  // GET /entities/some_uuid should return the Entity you expect it to
  const entity = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .expect(200)
  .end((err, res) => {
    request(server)
    .get('/entities/' + res.body.id)
    .auth('test', key)
    .expect(res => {
      res.body.rev = entity.rev
      res.body.created_at = entity.created_at
      res.body.updated_at = entity.updated_at
      res.body.password = entity.password
    })
    .expect(200, _.assign({}, entity, { id: res.body.id }), pass(t, 'returned correct entity'))
  });
});

test('it should not return any Entity given an invalid ID', function(t) {
  request(server)
  .get('/entities/asdasdasfas')
  .auth('test', key)
  .expect(404, pass(t, 'returned 404 not found'));
});

test('it should return all Entities with a given permission', function(t) {
  // GET /entities?perm.type=membership&perm.entity=some_uuid should return an Array of the Entities you expect it to
  const one = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(one)
  .end((err, oneRes) => {
    const onePerms = {
      type: 'bar',
      entity: oneRes.body.id
    };

    var two = genEntity();
    two.permissions = [onePerms];

    var three = genEntity();
    three.permissions = [onePerms];

    request(server)
    .post('/entities')
    .auth('test', key)
    .send(two)
    .end((err, twoRes) => {
      request(server)
      .post('/entities')
      .auth('test', key)
      .send(three)
      .end((err, threeRes) => {
        request(server)
        .get('/entities?perm.type=bar&perm.entity=' + oneRes.body.id)
        .auth('test', key)
        .expect(res => {
          res.body[0].rev = three.rev
          res.body[0].created_at = three.created_at
          res.body[0].updated_at = three.updated_at
          res.body[0].password = three.password
          res.body[1].rev = two.rev
          res.body[1].created_at = two.created_at
          res.body[1].updated_at = two.updated_at
          res.body[1].password = two.password
        })
        .expect(200)
        .end((err, res) => {
          var passed = pass(t, 'returned correct entities');
          if (_.some(res.body, _.assign({}, two, {id: twoRes.body.id}))
          && _.some(res.body, _.assign({}, three, {id: threeRes.body.id}))) {
            return passed();
          }
          return passed('Did not return correct entities');
        });
      });
    });
  });
});

test('it should not return any Entity given an invalid permission', function(t) {
  request(server)
  .get('/entities?perm.type=baz&perm.entity=foo')
  .auth('test', key)
  .expect(200, [], pass(t, 'returned 0 entities'));
});

test('it should allow composition of filters and paramaters', function(t) {
  // GET /entities/some_uuid?perm.type=membership&perm.entity=some_uuid should return an Entity if the Entity described by that uuid has the requested permission. If they don't have the requested permission it should 404

  // GET /entities?perm.type=membership&perm.entity=some_uuid&email=some_email should return an Entity if the Entity described by that email has the requested permission. If they don't have the requested permission it should 404
  const one = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(one)
  .end((err, oneRes) => {
    const one = oneRes.body;
    const onePerms = {
      type: 'composer',
      entity: one.id
    };

    var two = genEntity();
    two.permissions = [onePerms];

    // NOTE(nickm): Incoming waterfall, I was too deep into supertest to
    // refactor out by this point.

    request(server)
    .post('/entities')
    .auth('test', key)
    .send(two)
    .expect(res => {
      res.body.rev = two.rev
      res.body.created_at = two.created_at
      res.body.updated_at = two.updated_at
    })
    .end((err, twoRes) => {
      const two = twoRes.body;

      request(server)
      .get(`/entities/${two.id}?perm.type=composer&perm.entity=${one.id}`)
      .auth('test', key)
      .expect(200, two)
      .end(() => {
        request(server)
        .get(`/entities/${two.id}?perm.type=foo&perm.entity=bar`)
        .auth('test', key)
        .expect(404)
        .end(() => {
          request(server)
          .get(`/entities?perm.type=composer&perm.entity=${one.id}&email=${two.emails[0]}`)
          .auth('test', key)
          .expect(200, [two])
          .end(() => {
            request(server)
            .get(`/entities?perm.type=foo&perm.entity=bar&email=${two.emails[0]}`)
            .auth('test', key)
            .expect(200, [], pass(t, 'returned all correct entities'));
          });
        });
      });
    });
  });
});

test('it should allow an Entity to be updated if the rev property matches the existing representation in the database', function(t) {
  const entity = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .end((err, res) => {
    var updatedEntity = res.body;
    updatedEntity.emails.push(rando() + '@example.com')

    request(server)
    .post('/entities/' + updatedEntity.id)
    .auth('test', key)
    .send(updatedEntity)
    .expect(res => {
      res.body.rev = updatedEntity.rev
      res.body.updated_at = updatedEntity.updated_at
    })
    .expect(200, updatedEntity, pass(t, 'returned updated entity'))
  });
});

test('it should not allow an Entity to be updated if the rev property does not match the existing representation in the database', function(t) {
  const entity = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .end((err, res) => {
    var updatedEntity = res.body;
    updatedEntity.emails.push(rando() + '@example.com');
    updatedEntity.rev = 'foo';

    request(server)
    .post('/entities/'+updatedEntity.id)
    .auth('test', key)
    .send(updatedEntity)
    .expect(409, pass(t, 'returned 409'));
  });
});

test('it should refuse to consider an update request without a supplied rev', function(t) {
  const entity = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .end((err, res) => {
    var updatedEntity = res.body;
    updatedEntity.emails.push(rando() + '@example.com');
    updatedEntity.rev = undefined;

    request(server)
    .post('/entities/'+updatedEntity.id)
    .auth('test', key)
    .send(updatedEntity)
    .expect(400, pass(t, 'returned 400'));
  });
});

test('it should properly set the created_at property of an Entity on creation', function(t) {
  const entity = _.omit(genEntity(), 'created_at');

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .end((err, res) => {
    t.ok(res.body.created_at, 'has created_at');
    t.end();
  });
});

test('it should properly set the updated_at property of an Entity at update', function(t) {
  const entity = genEntity();

  request(server)
  .post('/entities')
  .auth('test', key)
  .send(entity)
  .end((err, res) => {
    var updatedEntity = res.body;
    updatedEntity.emails.push(rando() + '@example.com');

    request(server)
    .post('/entities')
    .auth('test', key)
    .send(updatedEntity)
    .end((err, res) => {
      t.notEqual(res.body.updated_at, updatedEntity.updated_at);
      t.end();
    });
  });
});

// Helper functions for below tests that require multiple entities
function populateEntities(amount) {
  const postEntity = () => new Promise((resolve, reject) => {
    request(server)
    .post('/entities')
    .auth('test', key)
    .send(genEntity())
    .expect(200)
    .end((err, res) => resolve(res.body))
  });

  return Promise.all(_.times(amount, () => postEntity()));
}

function updateEntity(entity) {
  return new Promise((resolve, reject) => {
    request(server)
    .post('/entities/' + entity.id)
    .auth('test', key)
    .send(entity)
    .expect(200)
    .end((err, res) => resolve(res.body))
  });
}

test('it should understand inheritance of permissions (Alice, Bob, Managers)', function(t) {
  /**
   * There are three Entities in the system. Alice and Bob are users. Managers is a group. Alice has the permission `owner` over Managers. Managers has the permission `owner` over Bob. Therefore, Alice has the permission `owner` over Bob.
  **/

  populateEntities(3)
  .then(entities => {
    var alice = entities[0];
    var bob = entities[1];
    var managers = entities[2];

    managers.permissions.push({
      type: 'owner',
      entity: bob.id
    });

    alice.permissions.push({
      type: 'owner',
      entity: managers.id
    });

    updateEntity(managers)
    .then(() => updateEntity(alice))
    .then(alice => {
      t.ok(_.some(alice.inherited_permissions, {
        type: 'owner',
        entity: bob.id
      }), 'alice has permission owner over bob');
      t.end();
    });
  });

});

test('it should understand inheritance of permissions (Steve, Georgina, Company)', function(t) {
  /**
   * There are three Entities in the system. Steve and Georgina are users. Company is a group. Georgina has the permission `member` of Company. Steve has the permission `owner` of Company. Company has no permissions. Steve does not have any permissions over Georgina.
  **/

  populateEntities(3)
  .then(entities => {
    var steve = entities[0];
    var georgina = entities[1];
    var company = entities[2];

    georgina.permissions.push({
      type: 'member',
      entity: company.id
    });

    steve.permissions.push({
      type: 'owner',
      entity: company.id
    });

    updateEntity(georgina)
    .then(() => updateEntity(steve))
    .then(steve => {
      t.ok(!_.some(steve.inherited_permissions, {
        type: 'owner',
        entity: georgina.id
      }), 'steve has no owner permission over georgina');

      t.ok(!_.some(steve.inherited_permissions, {
        type: 'member',
        entity: georgina.id
      }), 'steve no member permission over georgina');

      t.end();
    });
  });
});

test('it should understand inheritance of permissions (Francois, Le Boulangerie, Gazzas Beans)', function(t) {
  /**
   * Inheritance must be linear. There are three entities in the system. Francois is a user. Le Boulangerie and Gazza's Beans are groups. Francois holds the permission `purchaser` over Le Boulangerie. Le Boulangerie holds the permission `customer` over Gazza's Beans. Francois must _not_ be a customer of Gazza's Beans.
  **/

  populateEntities(3)
  .then(entities => {
    var francois = entities[0];
    var leBoul = entities[1];
    var gazzas = entities[2];

    francois.permissions.push({
      type: 'purchaser',
      entity: leBoul.id
    });

    leBoul.permissions.push({
      type: 'customer',
      entity: gazzas.id
    });

    updateEntity(leBoul)
    .then(() => updateEntity(francois))
    .then(francois => {
      t.ok(!_.some(francois.inherited_permissions, {
        type: 'customer',
        entity: gazzas.id
      }), 'francois is not a customer of gazzas beans');

      t.end();
    });
  });


});

test('it should not allow a circular inheritance structure to be created', function(t) {
  /**
   * Create three entities, one, two and three.
   * Give one permission over two
   * Give two permission over three
   * Everything should be okay
   * Attempt to give three permission over one
   * You should get a 4xx and the permission should not be added
  **/

  populateEntities(3)
  .then(entities => {
    var one = entities[0];
    var two = entities[1];
    var three = entities[2];

    one.permissions.push({
      type: 'owner',
      entity: two.id
    });

    two.permissions.push({
      type: 'owner',
      entity: three.id
    });

    updateEntity(one)
    .then(() => updateEntity(two))
    .then(() => {
      three.permissions.push({
        type: 'owner',
        entity: one.id
      });

      request(server)
      .post('/entities/' + three.id)
      .auth('test', key)
      .send(three)
      .expect(400, pass(t, 'permission not allowed'))
    });
  });
});

test('it should return an entity with the correct permissions after creation', function(t) {
  populateEntities(2)
  .then(entities => {
    var one = entities[0];
    var two = entities[1];

    two.permissions.push({
      type: 'owner',
      entity: one.id
    });

    updateEntity(two)
    .then(() => {
      var entity = genEntity();

      entity.permissions = [
        { type: 'owner', entity: two.id }
      ];

      request(server)
      .post('/entities')
      .auth('test', key)
      .send(entity)
      .expect(res => {
        t.ok(_.some(res.body.inherited_permissions, {
          entity: one.id,
          type: 'owner'
        }), 'contains inherited permissions');

        t.ok(_.some(res.body.permissions, {
          entity: two.id,
          type: 'owner'
        }), 'contains permissions');
      })
      .expect(200, pass(t, 'entity returned correctly'));
    });
  });
});
