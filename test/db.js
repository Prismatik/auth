var test = require('./tape');
var db = require('root/lib/db');
var dbTestHelper = require('root/test/db_test_helper');
var prismatikId;
var entityId;
var entityFromDb;
var entity = {name: 'Larry', email: 'larry@gmail.com', permissions: []};

function createAll(){
  return Promise.all([
    dbTestHelper.resetDb(),
    db.create('entities', {name: 'Prismatik'}),
    db.create('entities', entity)
  ]).then((res) => {
    prismatikId = res[1].id;
    entityId = res[2].id;
    db.create('entities', {type: 'developer', entity: prismatikId}, entityId, 'permissions');
    db.create('entities', {type: 'tester', entity: prismatikId}, entityId, 'permissions');
    db.create('entities', {type: 'UI Designer', entity: prismatikId}, entityId, 'permissions');
    db.create('entities', {type: 'dog washer', entity: prismatikId}, entityId, 'inherited_permissions');
    db.create('entities', {type: 'cat catcher', entity: prismatikId}, entityId, 'inherited_permissions');
   })
}

function ignite(description, cb) {
  test(description, (t) => {
    dbTestHelper.open()
    .then(() => {
      return dbTestHelper.resetDb();
    })
    .then(() => {
      return createAll();
    })
    .then(() => {
      cb(t).then(() => dbTestHelper.close());
    });
  });
}

ignite('db.create must not return errors when passing in an object', (t) => {
  return db.create('entities', {name: 'Garry'})
    .then(res => {
      t.ok(res, 'Must have not have errors');
      t.end();
    });
});

ignite('db.create must return new entity created when one object is passed', (t) => {
  return db.create('entities', {name: 'Arry'})
    .then(res => {
      t.equal(res.name, 'Arry', 'Must have one entity inserted with matching name');
      t.end();
    });
});

ignite('db.create must create new entities when an array of objects is passed', (t) => {
  var entities = [
    {name: 'Barry', permissions: [{ entity: prismatikId, type: 'developer' }]},
    {name: 'Harry', permissions: [{ entity: prismatikId, type: 'tester' }]}];
  return db.create('entities', entities)
    .then(res => {
      t.equal(res.length, entities.length, 'Must have many entries inserted');
      t.end();
    });
});

ignite('db.get must retrieve entity matching the ID', (t) => {
  return db.get('entities', entityId, 'id').then(res => {
    t.equal(res.id, entityId, 'Must have matching IDs');
    t.end();
  });
});

ignite('db.get must retrieve entity matching the email', (t) => {
  return db.get('entities', entity.email, 'email').then(res => {
    t.equal(res.email, entity.email, 'Must have matching emails');
    t.end();
  });
});

ignite('db.get must not retrieve entities not matching the permission type and entity', (t) => {
  return db.get('entities', {type: 'developer'}, 'permissions').then(res => {
    t.deepEqual(dbTestHelper.filterEntitiesByPermissions(res, {type: 'dog catcher', entity: 'nope'}), [], 'Must have empty array');
    t.end();
  });
});

ignite('db.get must retrieve entities matching the permission type and entity', (t) => {
  return db.get('entities', {type: 'developer', entity: prismatikId}, 'permissions').then(res => {
    t.equal(dbTestHelper.filterEntitiesByPermissions(res, {type: 'developer', entity: prismatikId}).length, 1, 'Must have populated array')
    t.end();
  });
});

ignite('db.get must not retrieve entities not matching the permission type', (t) => {
  return db.get('entities', {type: 'developer'}, 'permissions').then(res => {
    t.deepEqual(dbTestHelper.filterEntitiesByPermissions(res, {type: 'dog catcher'}), [], 'Must have empty array')
    t.end();
  });
});

ignite('db.get must return empty array if there are no entities matching the permission type', (t) => {
  return db.get('entities', {type:'Executive Administrator'}, 'permissions').then(res => {
    t.deepEqual(res, [], 'Must have an empty array');
    t.end();
  });
});

ignite('db.get must retrieve entities matching the permission types', (t) => {
  return db.get('entities', {type: 'developer'}, 'permissions').then(res => {
    t.equal(dbTestHelper.filterEntitiesByPermissions(res, {type: 'developer'}).length, res.length, 'Must have an array with permissions only matching permission types');
    t.end();
  });
});

ignite('db.get must return empty array if there are no entities matching the permission entities', (t) => {
  return db.get('entities', {entity:'nope'}, 'permissions').then(res => {
    t.deepEqual(res, [], 'Must have an empty array');
    t.end();
  });
});

ignite('db.get must retrieve entities matching the permission entities', (t) => {
  return db.get('entities', {entity: prismatikId}, 'permissions').then(res => {
    t.equal(res.length, 1, 'Must have an array with permission matching permission entities');
    t.end();
  });
});

ignite('db.update must not save the old version of the entity', (t) => {
  var updated = {id: entityId, name: 'Old Larry'};
  return db.update('entities', updated)
    .then(res => {
      t.notEqual(res.name, 'Larry', 'Must not have old name')
      t.end();
    })
});

ignite('db.update must save the new version of the entity', (t) => {
  var updated = {id: entityId, name: 'Super Larry'};
  return db.update('entities', updated)
    .then(res => {
      t.equal(res.name, updated.name, 'Must have new name')
      t.end();
    })
});

ignite('db.delete must not keep old entity in db', (t) => {
  return db.create('entities', {name: 'Parry'})
    .then(res => {
      return db.delete('entities', res.id);
    })
    .then(res => {
      return db.get('entities', 'Parry', 'name');
    })
    .then(res => {
      t.deepEqual(res, [], 'Must not include old entity');
      t.end();
    });
});

ignite('db.delete must delete one entity', (t) => {
  return db.create('entities', {name: 'Parry'})
    .then(res => {
      return db.delete('entities', res.id);
    })
    .then(res => {
      t.equal(res, null, 'Must return null');
      t.end();
    });
});

ignite('db.create must add permissions to entity if permissions array does not exist', (t) => {
  var parryId;
  return db.create('entities', {name: 'Parry'})
    .then(res => {
      parryId = res.id
      return db.create('entities', {type: 'UX Designer', entity: prismatikId}, parryId, 'permissions');
    })
    .then(res => {
      t.deepEqual(res.permissions, [{type: 'UX Designer', entity: prismatikId}], 'Must have new permission in permissions');
      t.end();
    });
});

ignite('db.create must not clear old permissions from the permissions array', (t) => {
  return db.create('entities', {type: 'UX Designer', entity: prismatikId}, entityId, 'permissions')
    .then(res => {
      t.deepEqual(res.permissions.filter(perm => perm.type === 'tester')[0].type, 'tester', 'Must still have tester permission');
      t.deepEqual(res.permissions.filter(perm => perm.type === 'developer')[0].type, 'developer', 'Must still have developer permission');
      t.end();
    });
});

ignite('db.create must add new permission to the permissions array', (t) => {
  return db.create('entities', {type: 'admin', entity: prismatikId}, entityId, 'permissions')
  .then(res => {
    t.deepEqual(res.permissions.filter(perm => perm.type === 'admin')[0].type, 'admin', 'Must have new Admin permission\'s type');
    t.deepEqual(res.permissions.filter(perm => perm.type === 'admin')[0].entity, prismatikId, 'Must have new Admin permission\'s entity id');
    t.end();
  });
});

ignite('db.create must add new permission to the inherited permissions array', (t) => {
  return db.create('entities', {type: 'hamster wheeler', entity: prismatikId}, entityId, 'inherited_permissions')
  .then(res => {
    t.equal(res.inherited_permissions.filter(perm => {
      return perm.type === 'hamster wheeler'})[0].type, 'hamster wheeler', 'Must have new hamster wheeler permission\'s type');
    t.equal(res.inherited_permissions.filter(perm => {
      return perm.entity === prismatikId})[0].entity, prismatikId, 'Must have new hamster wheeler permission\'s entity id');
    t.end();
  });
});

ignite('db.delete must not keep old permission in permissions array', (t) => {
  return db.delete('entities', entityId, {type: 'tester', entity: prismatikId}, 'permissions')
    .then(res => {
      t.deepEqual(res.permissions.filter(perm => perm.type === 'tester'), [], 'Must not have tester permission');
      t.deepEqual(res.permissions.filter(perm => perm.type === 'developer'), [{type: 'developer', entity: prismatikId}], 'Must still have old dveloper permission');
      t.deepEqual(res.permissions.filter(perm => perm.type === 'UI Designer'), [{type: 'UI Designer', entity: prismatikId}], 'Must still have old UI permission');
      t.end();
    });
});

ignite('db.delete must not keep old permission in inherited_permissions array', (t) => {
  return db.delete('entities', entityId, {type: 'dog washer', entity: prismatikId}, 'inherited_permissions')
  .then(res => {
    t.deepEqual(res.inherited_permissions.filter(perm => perm.type === 'dog washer'), [], 'Must not have dog washer inherited permission')
    t.deepEqual(res.inherited_permissions.filter(perm => perm.type === 'cat catcher'), [{type: 'cat catcher', entity: prismatikId}], 'Must still have cat catcher inherited permission')
    t.end();
  });
});
