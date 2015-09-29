var test = require('./tape');
var db = require('root/lib/db');
var dbTestHelper = require('root/test/db_test_helper');
var prismatikId;
var entityId;
var entityFromDb;
var entity = {name: 'Larry', email: 'larry@gmail.com', permissions: []};

test('setup', function (t) {
  dbTestHelper.resetDb()
    .then(res => {
      return db.createEntity({name: 'Prismatik'})
    })
    .then(res => {
      prismatikId = res.generated_keys[0];
    })
    .then(res => {
      return db.createEntity(entity)
    })
    .then(res => {
      entityId = res.generated_keys[0];
    })
    .then(res => {
      return db.addPermission(entityId, {type: 'developer', entity: prismatikId})
    })
    .then(res => {
      return db.addPermission(entityId, {type: 'tester', entity: prismatikId})
    })
    .then(res => {
      return db.addInheritedPermission(entityId, {type: 'dog washer', entity: prismatikId})
    })
    .then(res => {
      return db.getEntityById(entityId)
    })
    .then(res => {
      entityFromDb = res;
      console.log(res)
    })
    .then(res => {
      t.end();
    });
});

test('db.createEntity must not return errors when passing in an object', (t) => {
  db.createEntity({name: 'Garry'})
    .then(res => {
      t.equal(res.errors, 0, 'Must have not have errors');
      t.end();
    });
});

test('db.createEntity must return new entity created when one object is passed', (t) => {
  db.createEntity({name: 'Arry'})
    .then(res => {
      // t.equal(res.changes[0].new_val.name, 'Arry', 'Must have one entity inserted');
      t.ok(res.generated_keys[0], 'Must have one generated key');
      t.end();
    });
});

test('db.createEntity must create new entities when an array of objects is passed', (t) => {
  var entities = [
    {name: 'Barry', permissions: [{ entity: prismatikId, type: 'developer' }]},
    {name: 'Harry', permissions: [{ entity: prismatikId, type: 'tester' }]}];
  db.createEntity(entities)
    .then(res => {
      t.equal(res.inserted, entities.length, 'Must have many entries inserted');
      t.equal(res.generated_keys.length, entities.length, 'Must have the same amount of keys for entries inserted');
      t.end();
    });
});

test('db.getEntityById must retrieve entity matching the ID', (t) => {
  db.getEntityById(entityId).then(res => {
    t.equal(res.id, entityId, 'Must have matching IDs');
    t.end();
  });
});

test('db.getEntityByEmail must retrieve entity matching the email', (t) => {
  db.getEntityByEmail(entity.email).then(res => {
    t.equal(res.email, entity.email, 'Must have matching emails');
    t.end();
  });
});

test('db.getEntitiesByPermission must not retrieve entities not matching the permission type and entity', (t) => {
  db.getEntitiesByPermissionType('developer').then(res => {
    t.deepEqual(dbTestHelper.filterEntitiesByPermissions(res, {type: 'dog catcher', entity: 'nope'}), [], 'Must have empty array');
    t.end();
  });
});

test('db.getEntitiesByPermission must retrieve entities matching the permission type and entity', (t) => {
  db.getEntitiesByPermissionType('developer').then(res => {
    t.deepEqual(dbTestHelper.filterEntitiesByPermissions(res, {type: 'developer', entity: prismatikId}), [1], 'Must have populated array')
    t.end();
  });
});

test('db.getEntitiesByPermissionType must not retrieve entities not matching the permission type', (t) => {
  db.getEntitiesByPermissionType('developer').then(res => {
    t.deepEqual(dbTestHelper.filterEntitiesByPermissions(res, {type: 'dog catcher'}), [], 'Must have empty array')
    t.end();
  });
});

test('db.getEntitiesByPermissionType must return empty array if there are no entities matching the permission type', (t) => {
  db.getEntitiesByPermissionType('Executive Administrator').then(res => {
    t.deepEqual(res, [], 'Must have an empty array');
    t.end();
  });
});

test.skip('db.getEntitiesByPermissionType must retrieve entities matching the permission types', (t) => {
  db.getEntitiesByPermissionType('developer').then(res => {
    t.equal(res[0].permissions.contains, 'developer', 'Must have an array with permission matching permission types');
    t.end();
  });
});

test('db.getEntitiesByPermissionEntity must return empty array if there are no entities matching the permission entities', (t) => {
  db.getEntitiesByPermissionEntity('nope').then(res => {
    t.equal(res.length, 0, 'Must have an empty array');
    t.end();
  });
});

test.skip('db.getEntitiesByPermissionEntity must retrieve entities matching the permission entities', (t) => {
  db.getEntitiesByPermissionEntity(prismatikId).then(res => {
    t.equal(res[0], prismatikId, 'Must have an array with permission matching permission entities');
    t.end();
  });
});

test.skip('db.updateEntity must not save the old version of the entity', (t) => {
  db.updateEntity()
  t.end();
});

test.skip('db.updateEntity must save the new version of the entity', (t) => {
  db.updateEntity()
  t.end();
});

test('db.deleteEntity must not create entities', (t) => {
  db.createEntity({name: 'Parry'})
    .then(res => {
      return db.getEntityById(res.generated_keys[0]);
    })
    .then(res => {
      return db.deleteEntity(res);
    })
    .then(res => {
      t.equal(res.inserted, 0, 'Must not insert entries');
      t.end();
    });
});

test('db.deleteEntity must not update entities', (t) => {
  db.createEntity({name: 'Parry'})
    .then(res => {
      return db.getEntityById(res.generated_keys[0]);
    })
    .then(res => {
      return db.deleteEntity(res);
    })
    .then(res => {
      t.equal(res.replaced, 0, 'Must not replace entries');
      t.end();
    });
});

test('db.deleteEntity must delete one entity', (t) => {
  db.createEntity({name: 'Parry'})
    .then(res => {
      return db.getEntityById(res.generated_keys[0]);
    })
    .then(res => {
      return db.deleteEntity(res);
    })
    .then(res => {
      t.equal(res.deleted, 1, 'Must have one entry deleted');
      t.end();
    });
});

test('db.addPermission must add permissions to entity if permissions array does not exist', (t) => {
  var parryId;
  db.createEntity({name: 'Parry'})
    .then(res => {
      parryId = res.generated_keys[0]
      return db.addPermission(parryId, {type: 'UX Designer', entity: prismatikId});
    })
    .then(res => {
      t.deepEqual(res.permissions, [{type: 'UX Designer', entity: prismatikId}], 'Must have new permission in permissions');
      t.end();
    });
});

test('db.addPermission must not clear old permissions from the permissions array', (t) => {
  db.addPermission(entityId, {type: 'UX Designer', entity: prismatikId})
    .then(res => {
      t.deepEqual(res.permissions.filter(perm => {
        return perm.type === 'tester'})[0].type, 'tester', 'Must still have tester permission');
      t.deepEqual(res.permissions.filter(perm => {
        return perm.type === 'developer'})[0].type, 'developer', 'Must still have developer permission');
      t.end();
    });
});

test('db.addPermission must add new permission to the permissions array', (t) => {
  db.addPermission(entityId, {type: 'admin', entity: prismatikId})
  .then(res => {
    t.deepEqual(res.permissions.filter(perm => {
      return perm.type === 'admin'})[0].type, 'admin', 'Must have new Admin permission\'s type');
    t.deepEqual(res.permissions.filter(perm => {
      return perm.type === 'admin'})[0].entity, prismatikId, 'Must have new Admin permission\'s entity id');
    t.end();
  });
});

test('db.addInheritedPermission must add new permission to the inherited permissions array', (t) => {
  db.addInheritedPermission(entityId, {type: 'cat catcher', entity: prismatikId})
  .then(res => {
    t.equal(res.inherited_permissions.filter(perm => {
      return perm.type === 'cat catcher'})[0].type, 'cat catcher', 'Must have new cat catcher permission\'s type');
    t.equal(res.inherited_permissions.filter(perm => {
      return perm.entity === prismatikId})[0].entity, prismatikId, 'Must have new cat catcher permission\'s entity id');
    t.end();
  });
});

test('db.getPermissions must get permissions belonging to an entity for a given id', (t) => {
  db.getPermissions(entityId)
    .then(res => {
      t.ok(res.length, 'Must have an array of permissions');
      t.end();
    });
});

test('db.removePermission must not keep old permission in permissions array', (t) => {
  db.removePermission(entityId, {type: 'tester', entity: prismatikId})
    .then(res => {
      t.deepEqual(res.permissions.filter(perm => { return perm.type === 'tester'}), [], 'Must return empty Array')
      t.end();
    });
});

test('db.removeInheritedPermission must not keep old permission in inherited_permissions array', (t) => {
  db.removeInheritedPermission(entityId, {type: 'dog washer', entity: prismatikId})
  .then(res => {
    t.deepEqual(res.inherited_permissions.filter(perm => { return perm.type === 'dog washer'}), [], 'Must return empty Array')
    t.end();
  });
});
