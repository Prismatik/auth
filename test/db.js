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
      return db.create('entities', {name: 'Prismatik'});
    })
    .then(res => {
      prismatikId = res.id;
    })
    .then(res => {
      return db.create('entities', entity);
    })
    .then(res => {
      entityId = res.id;
    })
    .then(res => {
      return db.create('entities', {type: 'developer', entity: prismatikId}, entityId, 'permissions');
    })
    .then(res => {
      return db.create('entities', {type: 'tester', entity: prismatikId}, entityId, 'permissions');
    })
    .then(res => {
      return db.create('entities', {type: 'dog washer', entity: prismatikId}, entityId, 'inherited_permissions');
    })
    .then(res => {
      return db.get(entityId, 'entities', 'id');
    })
    .then(res => {
      entityFromDb = res;
      console.log(res);
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
      t.equal(res.name, 'Arry', 'Must have one entity inserted');
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
    t.equal(dbTestHelper.filterEntitiesByPermissions(res, {type: 'developer'}).length, 2, 'Must have an array with permission matching permission types');
    t.equal(res.length, 2, 'Must have an array with permission matching permission types');
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

test.skip('db.update must not save the old version of the entity', (t) => {
  var updated = {id: entityId, name: 'Super Larry'}
  db.update('entities', updated)
    .then(res => {
      t.notEqual(res.name, 'Larry', 'Must not have old name')
      t.end();
    })
});

test.skip('db.update must save the new version of the entity', (t) => {
  var updated = {id: entityId, name: 'Super Larry'}
  db.update('entities', updated)
    .then(res => {
      t.equal(res, updated.name, 'Must have new name')
      t.end();
    })
});

test.skip('db.delete must not create entities', (t) => {
  db.create('entities', {name: 'Parry'})
    .then(res => {
      return db.delete('entities', res.id);
    })
    .then(res => {
      t.equal(res.inserted, 0, 'Must not insert entries');
      t.end();
    });
});

test.skip('db.delete must not update entities', (t) => {
  db.create('entities', {name: 'Parry'})
    .then(res => {
      return db.delete('entities', res.id);
    })
    .then(res => {
      t.equal(res.replaced, 0, 'Must not replace entries');
      t.end();
    });
});

test.skip('db.delete must delete one entity', (t) => {
  db.create('entities', {name: 'Parry'})
    .then(res => {
      return db.delete('entities', res.id);
    })
    .then(res => {
      t.equal(res.deleted, 1, 'Must have one entry deleted');
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
      t.deepEqual(res.permissions.filter(perm => {
        return perm.type === 'tester'})[0].type, 'tester', 'Must still have tester permission');
      t.deepEqual(res.permissions.filter(perm => {
        return perm.type === 'developer'})[0].type, 'developer', 'Must still have developer permission');
      t.end();
    });
});

test('db.create must add new permission to the permissions array', (t) => {
  db.create('entities', {type: 'admin', entity: prismatikId}, entityId, 'permissions')
  .then(res => {
    t.deepEqual(res.permissions.filter(perm => {
      return perm.type === 'admin'})[0].type, 'admin', 'Must have new Admin permission\'s type');
    t.deepEqual(res.permissions.filter(perm => {
      return perm.type === 'admin'})[0].entity, prismatikId, 'Must have new Admin permission\'s entity id');
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

test('db.removePermission must not keep old permission in permissions array', (t) => {
  db.delete('entities', entityId, {type: 'tester', entity: prismatikId}, 'permissions')
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
