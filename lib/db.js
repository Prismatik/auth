var r = require('root/lib/db_init');

// This is a test helper method
exports.resetDb = () => {
  return r.table('entities')
    .delete()
    .run();
};

exports.createEntity = (entity) => {
  return r.table('entities')
    .insert(entity, {returnChanges: true})
    .run();
};

exports.getEntityById = (id) => {
  return r.table('entities')
    .get(id)
    .run();
};

exports.getEntityByEmail = (email) => {
  // .filter Automatically returns an array.
  // Since emails are unique, we only want one returned.
  return r.table('entities')
    .filter(r.row('email').eq(email))
    .run()
    .then(res => { return res[0] });
};

exports.getEntitiesByPermission = (type, entity) => {
  return r.table('entities')
    .filter(r.row('permissions')
      .contains({type: type, entity: entity})
    )
    .run();
};

exports.getEntitiesByPermissionType = (type) => {
  return r.table('entities')
    .filter(r.row('permissions')
      .contains(perm => {
        return perm('type').eq(type);
      })
    )
    .run();
};

exports.getEntitiesByPermissionEntity = (entity) => {
  return r.table('entities')
    .filter(r.row('permissions')
      .contains(perm => {
        return perm('entity').eq(entity);
      })
    )
    .run();
};

exports.updateEntity = (entity) => {
  // query = query.then() for fields
  return r.table('entities')
    .get(entity.id)
    .update(entity, {returnChanges: true})
    .run()
    .then(res => {
      return res.changes[0].new_val;
    });
};

exports.deleteEntity = (entity) => {
  return r.table('entities')
    .get(entity.id)
    .delete({returnChanges: true})
    .run();
};

exports.addPermission = (entity_id, permission) => {
  return r.table('entities')
    .get(entity_id)
    .update({permissions: r.row('permissions').default([])
      .append({
        type: permission.type,
        entity: permission.entity})
    }, {returnChanges: true})
    .run()
    .then(res => {
      return res.changes[0].new_val;
    });
};

exports.addInheritedPermission = (entity_id, permission) => {
  return r.table('entities')
    .get(entity_id)
    .update({inherited_permissions: r.row('inherited_permissions').default([]).append({
      type: permission.type,
      entity: permission.entity})
    }, {returnChanges: true})
    .run()
    .then(res => {
      return res.changes[0].new_val;
    });
};

exports.getPermissions = (id) => {
  return r.table('entities')
    .get(id)('permissions')
    .run();
    // TODO: return empty array if there are no perms
};

exports.removePermission = (entity_id, permission) => {
  return r.table('entities')
    .get(entity_id)
    .update(row => {
      return row.merge({
        permissions: row('permissions').filter(function(perm) {
          return perm('entity').ne(permission.entity) && perm('type').ne(permission.type);
     })
   })
    }, {returnChanges: true})
    .run()
    .then(res => {
      return res.changes[0].new_val;
    });
};

exports.removeInheritedPermission = (entity_id, permission) => {
  return r.table('entities')
    .get(entity_id)
    .update(row=> {
      return row.merge({
        inherited_permissions: row('inherited_permissions').filter(function(perm) {
          return perm('entity').ne(permission.entity) && perm('type').ne(permission.type);
     })
   })
    }, {returnChanges: true})
    .run()
    .then(res => {
      return res.changes[0].new_val;
    });
};
