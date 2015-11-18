const _ = require('lodash');
const test = require('./tape');
const entities = require('./fixtures/entities.json');
const r = require('root/lib/r');
const fanout = require('root/lib/fanout');

function setup() {
  return r.table('entities').insert(_.times(5, () => ({
    permissions: [],
    inherited_permissions: []
  })), { returnChanges: true }).run()
  .then(res => _.pluck(res.changes, 'new_val'));
}

function genPermission(type, item) {
  return {
    type: type,
    entity: item.id
  };
}

function addPermission(to, type, item) {
  const permission = genPermission(type, item);

  return r.table('entities').get(to.id).update(entity => ({
    permissions: entity('permissions').append(permission)
  })).run();
}

function addInherited(to, type, item) {
  const permission = genPermission(type, item);

  return r.table('entities').get(to.id).update(entity => ({
    inherited_permissions: entity('inherited_permissions').append(permission)
  })).run();
}

test('fanout.resolvePermissions resolves if passed no changed permissions', t => {
  fanout.resolvePermissions().then(() => {
    t.pass('fanout.resolvePermissions resolves');
    t.end();
  });
});

test('fanout.resolvePermissions adds the correct permissions from down the tree', t => {
  setup().then(entities => {
    addPermission(entities[1], 'owner', entities[2])
    .then(() => {
      const permissions = [genPermission('owner', entities[1])];

      return fanout.resolvePermissions(entities[0].id, permissions);
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      const expectedPermission = {
        entity: entities[2].id,
        type: 'owner'
      };

      t.ok(_.some(entity.inherited_permissions, expectedPermission), 'inherited_permissions includes expectedPermission');
      t.end();
    });
  });
});

test('fanout.resolvePermissions does not duplicate permissions', t => {
  setup().then(entities => {
    Promise.all([
      addPermission(entities[1], 'owner', entities[3]),
      addPermission(entities[2], 'owner', entities[3])
    ])
    .then(() => {
      const permissions = [
        genPermission('owner', entities[1]),
        genPermission('owner', entities[2])
      ];

      return fanout.resolvePermissions(entities[0].id, permissions)
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      const expectedPermission = {
        entity: entities[3].id,
        type: 'owner'
      };

      t.ok(_.some(entity.inherited_permissions, expectedPermission), 'inherited_permissions includes expectedPermission');
      t.equal(entity.inherited_permissions.length, 1, 'inherited_permissions is length 1')
      t.end();
    });
  });
});

test('fanout.resolvePermissions adds the correct inherited_permissions from down the tree', t => {
  setup().then(entities => {
    addInherited(entities[1], 'owner', entities[2])
    .then(() => {
      const permissions = [genPermission('owner', entities[1])];
      return fanout.resolvePermissions(entities[0].id, permissions)
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      const expectedPermission = {
        entity: entities[2].id,
        type: 'owner'
      };

      t.ok(_.some(entity.inherited_permissions, expectedPermission), 'inherited_permissions includes expectedPermission');
      t.end();
    });
  });
});

test('fanout.resolvePermissions does not duplicate inherited_permissions', t => {
  setup().then(entities => {
    Promise.all([
      addInherited(entities[1], 'owner', entities[3]),
      addInherited(entities[2], 'owner', entities[3])
    ])
    .then(() => {
      const permissions = [
        genPermission('owner', entities[1]),
        genPermission('owner', entities[2])
      ];

      return fanout.resolvePermissions(entities[0].id, permissions)
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      const expectedPermission = {
        entity: entities[3].id,
        type: 'owner'
      };

      t.ok(_.some(entity.inherited_permissions, expectedPermission), 'inherited_permissions includes expectedPermission');
      t.equal(entity.inherited_permissions.length, 1, 'inherited_permissions is length 1')
      t.end();
    });
  });
});

test('fanout.resolvePermissions does not duplicate inherited_permissions that match permissions', t => {
  setup().then(entities => {
    Promise.all([
      addPermission(entities[1], 'owner', entities[3]),
      addInherited(entities[2], 'owner', entities[3])
    ])
    .then(() => {
      const permissions = [
        genPermission('owner', entities[1]),
        genPermission('owner', entities[2]),
      ];

      return fanout.resolvePermissions(entities[0].id, permissions)
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      const expectedPermission = {
        entity: entities[3].id,
        type: 'owner'
      };

      t.ok(_.some(entity.inherited_permissions, expectedPermission), 'inherited_permissions includes expectedPermission');
      t.equal(entity.inherited_permissions.length, 1, 'inherited_permissions is length 1')
      t.end();
    });
  });
});

test('fanout.resolvePermissions adds the correct inherited_permissions up the tree', t => {
  setup().then(entities => {
    Promise.all([
      addPermission(entities[0], 'owner', entities[1]),
      addPermission(entities[2], 'owner', entities[3])
    ])
    .then(() => {
      const permissions = [
        genPermission('owner', entities[2])
      ];

      return fanout.resolvePermissions(entities[1].id, permissions);
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      const expectedPermissionEntityThree = {
        entity: entities[3].id,
        type: 'owner'
      };

      const expectedPermissionEntityTwo = {
        entity: entities[2].id,
        type: 'owner'
      };

      t.ok(_.some(entity.inherited_permissions, expectedPermissionEntityThree), 'inherited_permissions includes expectedPermission for entity three');
      t.ok(_.some(entity.inherited_permissions, expectedPermissionEntityTwo), 'inherited_permissions includes expectedPermission for entity two');
      t.equal(entity.inherited_permissions.length, 2, 'inherited_permissions is length 2')
      t.end();
    });
  });
});

test('fanout.resolvePermissions adds multiple inherited_permissions up the tree', t => {
  setup().then(entities => {
    addPermission(entities[0], 'owner', entities[1])
    .then(() => {
      const permissions = [
        genPermission('owner', entities[2]),
        genPermission('owner', entities[3])
      ];

      return fanout.resolvePermissions(entities[1].id, permissions);
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      t.equal(entity.inherited_permissions.length, 2, 'inherited_permissions is length 2')
      t.end();
    });
  });
});

test('fanout.resolvePermissions adds inherited_permissions in between up the tree', t => {
  setup().then(entities => {
    Promise.all([
      addPermission(entities[0], 'owner', entities[1]),
      addPermission(entities[2], 'owner', entities[3])
    ])
    .then(() => {
      // Add 1--(owner)->2
      const permissions = [
        genPermission('owner', entities[2])
      ];

      return fanout.resolvePermissions(entities[1].id, permissions);
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      t.equal(entity.inherited_permissions.length, 2, 'inherited_permissions is length 2')
      t.end();
    })
  });
})

test('fanout.resolvePermissions does not duplicate inherited_permissions up the tree', t => {
  setup().then(entities => {
    Promise.all([
      addPermission(entities[0], 'owner', entities[1]),
      addPermission(entities[2], 'owner', entities[4]),
      addPermission(entities[3], 'owner', entities[4])
    ])
    .then(() => {
      const permissions = [
        genPermission('owner', entities[2]),
        genPermission('owner', entities[3]),
      ];

      return fanout.resolvePermissions(entities[1].id, permissions);
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      const expectedPermission = {
        entity: entities[4].id,
        type: 'owner'
      };

      t.ok(_.some(entity.inherited_permissions, expectedPermission), 'inherited_permissions includes expectedPermission');
      t.equal(entity.inherited_permissions.length, 3, 'inherited_permissions is length 3')
      t.end();
    });
  });
});

test('fanout.resolvePermissions does not add inherited_permissions of the wrong type', t => {
  setup().then(entities => {
    addPermission(entities[1], 'owner', entities[2])
    .then(() => {
      const permissions = [
        genPermission('customer', entities[1])
      ];

      return fanout.resolvePermissions(entities[0].id, permissions);
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      t.equal(entity.inherited_permissions.length, 0, 'inherited_permissions is length 0');
      t.end();
    });
  });
});

test('fanout.resolvePermissions only adds inherited_permissions of the right type', t => {
  setup().then(entities => {
    Promise.all([
      addPermission(entities[1], 'owner', entities[2]),
      addPermission(entities[1], 'customer', entities[2])
    ])
    .then(() => {
      const permissions = [
        genPermission('customer', entities[1])
      ];

      return fanout.resolvePermissions(entities[0].id, permissions);
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      const expectedPermission = {
        type: 'customer',
        entity: entities[2].id
      }

      t.ok(_.some(entity.inherited_permissions, expectedPermission), 'inherited_permissions includes expectedPermission');
      t.equal(entity.inherited_permissions.length, 1, 'inherited_permissions is length 1');
      t.end();
    });
  });
});

test('fanout.resolvePermissions correctly adjusts parent permissions', t => {
  setup().then(entities => {
    Promise.all([
      addPermission(entities[0], 'owner', entities[1]),
      addPermission(entities[2], 'owner', entities[3])
    ])
    .then(() => {
      // Add 1--(owner)->2
      const permissions = [
        genPermission('owner', entities[2])
      ];

      return fanout.resolvePermissions(entities[1].id, permissions);
    })
    .then(() => {
      // Replace w/ 1--(owner)->4
      const permissions = [
        genPermission('owner', entities[4])
      ];

      return fanout.resolvePermissions(entities[1].id, permissions);
    })
    .then(() => r.table('entities').get(entities[0].id).run())
    .then(entity => {
      const expectedPermission = {
        type: 'owner',
        entity: entities[4].id
      };

      t.ok(_.some(entity.inherited_permissions, expectedPermission), 'inherited_permissions includes expectedPermission');
      t.equal(entity.inherited_permissions.length, 1, 'inherited_permissions is length 1');
      t.end();
    });
  });
});

test('fanout.resolvePermissions rejects with an error on circular inheritance', t => {
  setup().then(entities => {
    addPermission(entities[0], 'owner', entities[1])
    .then(() => {
      const permissions = [
        genPermission('owner', entities[0])
      ];

      return fanout.resolvePermissions(entities[1].id, permissions)
    })
    .catch(e => {
      t.equal(e.message, 'Circular inheritance found. type: owner, parent: ' + entities[0].id)
      t.end();
    });
  });
});

test('fanout.resolvePermissions rejects with an error on circular inheritance of oneself', t => {
  setup().then(entities => {
    const permissions = [
      genPermission('owner', entities[0])
    ];

    return fanout.resolvePermissions(entities[0].id, permissions)
    .catch(e => {
      t.equal(e.message, 'Circular inheritance found. type: owner, parent: ' + entities[0].id)
      t.end();
    });
  });
});
