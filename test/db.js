var test = require('./tape');
var db = require('root/lib/db');
var dbTestHelper = require('root/test/db_test_helper');
var prismatikId;
var entityId;
var entityFromDb;
var entity = {name: 'Larry', email: 'larry@gmail.com', permissions: []};

test('setup', function (t) {
    Promise.all([
      dbTestHelper.resetDb(),
      db.create('entities', {name: 'Prismatik'}),
      db.create('entities', entity)
    ]).then((res) => {
      prismatikId = res[1].id;
      entityId = res[2].id;
      db.create('entities', {type: 'developer', entity: prismatikId}, entityId, 'permissions');
      db.create('entities', {type: 'tester', entity: prismatikId}, entityId, 'permissions');
      db.create('entities', {type: 'dog washer', entity: prismatikId}, entityId, 'inherited_permissions');
     })
    .then(res => {
      t.end();
    });
});

test('db.create must not return errors when passing in an object', (t) => {
  db.create('entities', {name: 'Garry'})
    .then(res => {
      t.ok(res, 'Must have not have errors');
      t.end();
    });
});

test('db.create must return new entity created when one object is passed', (t) => {
  db.create('entities', {name: 'Arry'})
    .then(res => {
      t.equal(res.name, 'Arry', 'Must have one entity inserted with matching name');
      t.end();
    });
});

test('db.create must create new entities when an array of objects is passed', (t) => {
  var entities = [
    {name: 'Barry', permissions: [{ entity: prismatikId, type: 'developer' }]},
    {name: 'Harry', permissions: [{ entity: prismatikId, type: 'tester' }]}];
  db.create('entities', entities)
    .then(res => {
      t.equal(res.length, entities.length, 'Must have many entries inserted');
      t.end();
    });
});

test('db.get must retrieve entity matching the ID', (t) => {
  db.get(entityId, 'entities', 'id').then(res => {
    t.equal(res.id, entityId, 'Must have matching IDs');
    t.end();
  });
});

test('db.get must retrieve entity matching the email', (t) => {
  db.get(entity.email, 'entities', 'email').then(res => {
    t.equal(res.email, entity.email, 'Must have matching emails');
    t.end();
  });
});

test('db.get must not retrieve entities not matching the permission type and entity', (t) => {
  db.get({type: 'developer'}, 'entities', 'permissions').then(res => {
    t.deepEqual(dbTestHelper.filterEntitiesByPermissions(res, {type: 'dog catcher', entity: 'nope'}), [], 'Must have empty array');
    t.end();
  });
});

test('db.get must retrieve entities matching the permission type and entity', (t) => {
  db.get({type: 'developer', entity: prismatikId}, 'entities', 'permissions').then(res => {
    t.equal(dbTestHelper.filterEntitiesByPermissions(res, {type: 'developer', entity: prismatikId}).length, 2, 'Must have populated array')
    t.end();
  });
});

test('db.get must not retrieve entities not matching the permission type', (t) => {
  db.get({type: 'developer'}, 'entities', 'permissions').then(res => {
    t.deepEqual(dbTestHelper.filterEntitiesByPermissions(res, {type: 'dog catcher'}), [], 'Must have empty array')
    t.end();
  });
});

test('db.get must return empty array if there are no entities matching the permission type', (t) => {
  db.get({type:'Executive Administrator'}, 'entities', 'permissions').then(res => {
    t.deepEqual(res, [], 'Must have an empty array');
    t.end();
  });
});

test('db.get must retrieve entities matching the permission types', (t) => {
  db.get({type: 'developer'}, 'entities', 'permissions').then(res => {
    t.equal(dbTestHelper.filterEntitiesByPermissions(res, {type: 'developer'}).length, res.length, 'Must have an array with permissions only matching permission types');
    t.end();
  });
});

test('db.get must return empty array if there are no entities matching the permission entities', (t) => {
  db.get({entity:'nope'}, 'entities', 'permissions').then(res => {
    t.deepEqual(res, [], 'Must have an empty array');
    t.end();
  });
});

test('db.get must retrieve entities matching the permission entities', (t) => {
  db.get({entity: prismatikId}, 'entities', 'permissions').then(res => {
    t.equal(res.length, 3, 'Must have an array with permission matching permission entities');
    t.end();
  });
});

test('db.update must not save the old version of the entity', (t) => {
  var updated = {id: entityId, name: 'Old Larry'}
  db.update('entities', updated)
    .then(res => {
      t.notEqual(res.name, 'Larry', 'Must not have old name')
      t.end();
    })
});

test('db.update must save the new version of the entity', (t) => {
  var updated = {id: entityId, name: 'Super Larry'}
  db.update('entities', updated)
    .then(res => {
      t.equal(res.name, updated.name, 'Must have new name')
      t.end();
    })
});

test('db.delete must not keep old entity in db', (t) => {
  db.create('entities', {name: 'Parry'})
    .then(res => {
      return db.delete('entities', res.id);
    })
    .then(res => {
      return db.get('Parry', 'entities', 'name');
    })
    .then(res => {
      t.deepEqual(res, [], 'Must not include old entity');
      t.end();
    });
});

test('db.delete must delete one entity', (t) => {
  db.create('entities', {name: 'Parry'})
    .then(res => {
      return db.delete('entities', res.id);
    })
    .then(res => {
      t.equal(res, null, 'Must return null');
      t.end();
    });
});

test('db.create must add permissions to entity if permissions array does not exist', (t) => {
  var parryId;
  db.create('entities', {name: 'Parry'})
    .then(res => {
      parryId = res.id
      return db.create('entities', {type: 'UX Designer', entity: prismatikId}, parryId, 'permissions');
    })
    .then(res => {
      t.deepEqual(res.permissions, [{type: 'UX Designer', entity: prismatikId}], 'Must have new permission in permissions');
      t.end();
    });
});

test('db.create must not clear old permissions from the permissions array', (t) => {
  db.create('entities', {type: 'UX Designer', entity: prismatikId}, entityId, 'permissions')
    .then(res => {
      t.deepEqual(res.permissions.filter(perm => perm.type === 'tester')[0].type, 'tester', 'Must still have tester permission');
      t.deepEqual(res.permissions.filter(perm => perm.type === 'developer')[0].type, 'developer', 'Must still have developer permission');
      t.end();
    });
});

test('db.create must add new permission to the permissions array', (t) => {
  db.create('entities', {type: 'admin', entity: prismatikId}, entityId, 'permissions')
  .then(res => {
    t.deepEqual(res.permissions.filter(perm => perm.type === 'admin')[0].type, 'admin', 'Must have new Admin permission\'s type');
    t.deepEqual(res.permissions.filter(perm => perm.type === 'admin')[0].entity, prismatikId, 'Must have new Admin permission\'s entity id');
    t.end();
  });
});

test('db.create must add new permission to the inherited permissions array', (t) => {
  db.create('entities', {type: 'cat catcher', entity: prismatikId}, entityId, 'inherited_permissions')
  .then(res => {
    t.equal(res.inherited_permissions.filter(perm => {
      return perm.type === 'cat catcher'})[0].type, 'cat catcher', 'Must have new cat catcher permission\'s type');
    t.equal(res.inherited_permissions.filter(perm => {
      return perm.entity === prismatikId})[0].entity, prismatikId, 'Must have new cat catcher permission\'s entity id');
    t.end();
  });
});

test('db.delete must not keep old permission in permissions array', (t) => {
  db.delete('entities', entityId, {type: 'tester', entity: prismatikId}, 'permissions')
    .then(res => {
      t.deepEqual(res.permissions.filter(perm => perm.type === 'tester'), [], 'Must not have tester permission');
      t.deepEqual(res.permissions.filter(perm => perm.type === 'developer'), [{type: 'developer', entity: prismatikId}], 'Must still have old dveloper permission');
      t.deepEqual(res.permissions.filter(perm => perm.type === 'UX Designer'), [{type: 'UX Designer', entity: prismatikId}], 'Must still have old UX permission');
      t.end();
    });
});

test('db.delete must not keep old permission in inherited_permissions array', (t) => {
  db.delete('entities', entityId, {type: 'dog washer', entity: prismatikId}, 'inherited_permissions')
  .then(res => {
    t.deepEqual(res.inherited_permissions.filter(perm => perm.type === 'dog washer'), [], 'Must not have dog washer inherited permission')
    t.deepEqual(res.inherited_permissions.filter(perm => perm.type === 'cat catcher'), [{type: 'cat catcher', entity: prismatikId}], 'Must still have cat catcher inherited permission')
    t.end();
  });
});
