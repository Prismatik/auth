var test = require('./tape');
var db = require('root/lib/db');
var prismatikId;
var entityId;
var entityFromDb;
var entity = {name: 'Larry', email: 'larry@gmail.com', permissions: []};

test('setup', function (t) {
  db.resetDb()
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
  db.createEntity({name: 'Larry'})
    .then(res => {
      t.equal(res.errors, 0, 'Must have zero errors returned');
      t.end();
    });
    // t.equal(db.createEntity({name: 'Larry'}).errors, 0, 'Must have zero errors returned');
    // t.end();
});

test('db.createEntity must create new entity when one object is passed', (t) => {
  db.createEntity({name: 'Larry'})
    .then(res => {
      t.equal(res.inserted, 1, 'Must have one entity inserted');
      t.ok(res.generated_keys[0], 'Must have one generated key');
      t.end();
    });
});

test('db.createEntity must create new entities when an array of objects is passed', (t) => {
  var entities = [{name: 'Larry'},{name: 'Barry'},{name: 'Harry'}]
  db.createEntity(entities)
    .then(res => {
      t.equal(res.inserted, entities.length, 'Must have many entries inserted');
      t.end();
    });
});

test('db.getEntity must retrieve entity matching the UUID', (t) => {
  db.getEntity()
  t.end();
});

test('db.updateEntity must not save the old version of the entity', (t) => {
  db.getEntity()
  t.end();
});

test('db.deleteEntity', (t) => {
  var entity;
  // Create entity and
  db.createEntity({name: 'Larry'})
    .then(res => {
      db.getEntity(res.generated_keys[0])
        .then(res => {
          entity = res;
        });
    });

  db.deleteEntity(entity)
    .then(res => {
      t.equal(res.deleted, 1, 'Must have one entry deleted');
      t.end();
    });
});

test('db.addPermission', (t) => {
  db.getEntity()
  t.end();
});

test('db.addInheritedPermission', (t) => {
  db.getEntity()
  t.end();
});

test('db.getPermissions', (t) => {
  db.getEntity()
  t.end();
});

test('db.removePermission', (t) => {
  db.getEntity()
  t.end();
});

test('db.removeInheritedPermission', (t) => {
  db.getEntity()
  t.end();
});