var config = require('root/config');
require('required_env')(config.env);
var test = require('./tape');
var server = require('root/lib/server');
var request = require('request-promise');
var entities = require('root/test/fixtures/entities');

var unauthed = 'http://localhost:'+process.env.PORT;
var url = 'http://test:'+process.env.API_KEY+'@localhost:'+process.env.PORT;

var fail = function(t) {
  return function() {
    t.fail();
    t.end();
  }
};

// Feel free to split these tests out into files, write additional ones, etc. Change the runner if you like.
// I've written this spec in the mindset of e2e integration tests. ie: stand up a server and throw queries at it with superagent or request or similar. We should also write unit tests for the actual code as we go.

// Note that I haven't given a great deal of thought to PUT vs POST in these tests, so if it makes sense to substitute, test both, etc, just do it.
//
test('stand up the server', function(t) {
  server.start().then(function(instance) {
    t.end();
  }).catch(function() {
    t.fail();
  });
});

test('it should return 403 to a request with no auth', function(t) {
  request(unauthed)
  .catch(function(err) {
    t.equal(err.statusCode, 401);
    t.end();
  });
});

test('it should not allow an authorised request to POST an Entity resource', function(t) {
  request.post(url+'/entities').json(entities[0]).then(function(res, body) {
    t.equal(res.statusCode, 200);
    t.end();
  })
  .catch(fail(t));
  // Probably just use something like miniauth (https://www.npmjs.com/package/miniauth) for now. The inital use case for this is just something that API services can access. We don't need to worry about end users talking to it directly as yet, though that would be good in the future.
});

test('it should allow an authorised request to GET an Entity resource after POSTing it', function(t) {
  var entity = entities[0];
  request.post(url+'/entities').json(entity).then(function(res, body) {
    t.equal(res.statusCode, 200);
  }).then(function() {
    return request.get(url+'/entities/'+entity.id);
  }).then(function(res, body) {
    t.equal(res.statusCode, 200);
    t.deepEqual(body, entity);
    t.end();
  })
  .catch(fail(t));
});

test('it should reject the POST of a malformed Entity resource', function(t) {
  request.post(url+'/entities').json({hai: 'foo'})
  .catch(function(err) {
    t.equal(err.statusCode, 400);
    t.end();
  });
});

test('it should enforce that emails are unique', function(t) {
  var one = {
    emails: 'sample@example.com',
  };
  request.post(url+'/entities').json(one)
  .then(function(res) {
    t.equal(res.statusCode, 200);
  })
  .then(function() {
    return request.post(url+'/entities').json(sample)
  })
  .catch(function(err) {
    t.equal(err.statusCode, 409);
    t.end();
  });
});

test.skip('it should create a token given the correct password for a UID', function(t) {
  // Set up an entity, then POST to /login with the entity's UID and password. It should return a token
});

test.skip('it should create a token given the correct password and an email', function(t) {
  // Set up an entity, then POST to /login with the entity's email and password. It should return a token
});

test('it should not create a token given the incorrect password', function(t) {
  var req = {
    emails: ['incorpass@example.com'],
    password: 'somebcrypthash'
  };
  request.post(url+'/entities').json(req)
  .then(function(res, body) {
    return request.post(url+'/token').json({
      id: body.id,
      password: 'wrong'
    });
  }).catch(function(err) {
    t.equal(err.statusCode, 403);
    t.end();
  });
});

test.skip('it should return the Entity associated with a valid token', function(t) {
  // GET /entities?token=some_jwt should return the Entity you expect it to. To stay RESTful this should be an array that only ever has one element.
});

test('it should not return any Entity given an invalid token', function(t) {
  request.get(url+'/entities?token=foo')
  .catch(function(err) {
    t.equal(err.statusCode, 403);
    t.end();
  });
});

test('it should return the Entity associated with a valid email', function(t) {
  var req = {
    emails: ['validemail@example.com']
  }
  request.post(url+'/entities').json(req)
  .then(function(res, body) {
    t.equal(res.statusCode, 200);
    t.deepEqual(body.emails, req.emails);
    return request.get(url+'/entities?email=validemail%40example.com')
  })
  .then(function(res, body) {
    t.equal(res.statusCode, 200);
    t.deepEqual(body[0].emails, req.emails);
    t.end();
  })
  .catch(fail(t));
});

test('it should not return any Entity given an invalid email', function(t) {
  request.get(url+'/entities?email=foobarbaz%40example.com')
  .then(function(res, body) {
    t.equal(res.statusCode, 200);
    t.equal(body.length, 0);
    t.end();
  })
  .catch(fail(t));
});

test('it should return the Entity associated with a valid ID', function(t) {
  // GET /entities/some_uuid should return the Entity you expect it to
  var req = {
    emails: ['validID@example.com']
  }
  request.post(url+'/entities').json(req)
  .then(function(res, body) {
    t.equal(res.statusCode, 200);
    t.deepEqual(body.emails, req.emails);
    return request.get(url+'/entities/'+body.id)
  })
  .then(function(res, body) {
    t.equal(res.statusCode, 200);
    t.deepEqual(body[0].emails, req.emails);
    t.end();
  })
  .catch(fail(t));
});

test('it should not return any Entity given an invalid ID', function(t) {
  request.get(url+'/entities/asdasdasfas')
  .catch(function(err) {
    t.equal(err.statusCode, 404);
    t.end();
  });
});

test('it should return all Entities with a given permission', function(t) {
  // GET /entities?perm.type=membership&perm.entity=some_uuid should return an Array of the Entities you expect it to
  var one = {
    emails: ['permsone@example.com'],
    permissions: [
      {
        type: 'bar',
        entity: 'foo'
      }
    ]
  };
  var two = {
    emails: ['permstwo@example.com'],
    permissions: [
      {
        type: 'bar',
        entity: 'foo'
      }
    ]
  };
  request.post(url+'/entities').json(one)
  .then(function() {
    return request.post(url+'/entities').json(two)
  })
  .then(function(res, body) {
    return request.get(url+'/entities?perm.type=bar&perm.entity=foo')
  })
  .then(function(res, body) {
    t.plan(4);
    t.equal(res.statusCode, 200);
    t.equal(body.length, 2);
    body.forEach(function(elem) {
      if (elem.emails[0] === 'persone@example.com') t.ok();
      if (elem.emails[0] === 'perstwo@example.com') t.ok();
    });
  })
  .catch(fail(t));
});

test('it should not return any Entity given an invalid permission', function(t) {
  request.get(url+'/entities?perm.type=baz&perm.entity=foo')
  .catch(function(err) {
    t.equal(err.statusCode, 404);
    t.end();
  });
});

test('it should allow composition of filters and paramaters', function(t) {
  // GET /entities/some_uuid?perm.type=membership&perm.entity=some_uuid should return an Entity if the Entity described by that uuid has the requested permission. If they don't have the requested permission it should 404

  // GET /entities?perm.type=membership&perm.entity=some_uuid&email=some_email should return an Entity if the Entity described by that email has the requested permission. If they don't have the requested permission it should 404
  var req = {
    emails: ['composition@example.com'],
    permissions: [{
      type: 'composer',
      entity: 'mozart'
    }]
  };
  request.post(url+'/entities').json(req)
  .then(function(res, body) {
    var expect404 = function(err) {
      if (err.statusCode !== 404) throw err;
      return Promise.resolve(null, ['dummy']);
    };
    return Promise.all([
      request.get(url+'/entities/'+body.id+'?perm.type=composer&perm.entity=mozart'), // 200
      request.get(url+'/entities/'+body.id+'?perm.type=foo&perm.entity=bar').catch(expect404), // 404
      request.get(url+'/entities?perm.type=composer&perm.entity=mozart&email=composition%40example.com'), // 200
      request.get(url+'/entities?perm.type=foo&perm.entity=bar&email=composition%40example.com').catch(expect404), // 404
    ]);
  })
  .then(function(results) {
    results.forEach(function(res, body) {
      t.equal(body.length, 1);
    });
    t.end();
  })
  .catch(fail(t));
});

test('it should allow an Entity to be updated if the rev property matches the existing representation in the database', function(t) {
  var req = {
    emails: ['revtest@example.com'],
  };
  request.post(url+'/entities').json(req)
  .then(function(res, body) {
    req.rev = body.rev;
    req.emails.push('revtest2@example.com');
    return request.post(url+'/entities').json(req);
  })
  .then(function(res, body) {
    t.equal(res.statusCode, 200);
    t.notEqual(body.rev, req.rev);
    t.end();
  })
  .catch(fail(t));
});

test('it should not allow an Entity to be updated if the rev property does not match the existing representation in the database', function(t) {
  var req = {
    emails: ['failrevtest@example.com'],
  };
  request.post(url+'/entities').json(req)
  .then(function(res, body) {
    req.rev = 'foo';
    req.emails.push('failrevtest2@example.com');
    return request.post(url+'/entities').json(req);
  })
  .catch(function(err) {
    t.equal(err.statusCode, 409);
    t.end();
  });
});

test('it should properly set the created_at property of an Entity on creation', function(t) {
  var req = {
    emails: ['created@example.com'],
  };
  request.post(url+'/entities').json(req)
  .then(function(res, body) {
    t.ok(body.created_at);
    t.end();
  })
  .catch(fail(t));
});

test('it should properly set the updated_at property of an Entity at update', function(t) {
  var req = {
    emails: ['updated1@example.com'],
  };
  var b1;
  request.post(url+'/entities').json(req)
  .then(function(res, body) {
    b1 = body;
    req.rev = body.rev;
    req.emails.push('updated2@example.com');
    return request.post(url+'/entities').json(req);
  })
  .then(function(res, body) {
    t.equal(err.statusCode, 200);
    t.ok(body.updated_at);
    t.notEqual(b1.updated_at, body.updated_at);
    t.end();
  })
  .catch(fail(t));
});

test.skip('it should understand inheritance of permissions', function(t) {
  /**
   * There are three Entities in the system. Alice and Bob are users. Managers is a group. Alice has the permission `owner` over Managers. Managers has the permission `owner` over Bob. Therefore, Alice has the permission `owner` over Bob.
  **/

  /**
   * There are three Entities in the system. Steve and Georgina are users. Company is a group. Georgina has the permission `member` of Company. Steve has the permission `owner` of Company. Company has no permissions. Steve does not have any permissions over Georgina.
  **/

  /**
   * Inheritance must be linear. There are three entities in the system. Francois is a user. Le Boulangerie and Gazza's Beans are groups. Francois holds the permission `purchaser` over Le Boulangerie. Le Boulangerie holds the permission `customer` over Gazza's Beans. Francois must _not_ be a customer of Gazza's Beans.
  **/

  // We should use a document store for this and calculate all the inherited_permissions at write time. This will mean that writes are slow, but reads are super fast. That's totally fine for this use case.
  // The logic to update all of the inherited permissions at write time will be a little messy with some recursion, but that's okay.
});

test.skip('it should not allow a circular inheritance structure to be created', function(t) {
  /**
   * Create three entities, one, two and three.
   * Give one permission over two
   * Give two permission over three
   * Everything should be okay
   * Attempt to give three permission over one
   * You should get a 4xx and the permission should not be added
  **/
});

test('teardown server', function(t) {
  server.end().then(serv => {
    t.equal(serv, null, 'server is null');
    t.end();
  });
});
