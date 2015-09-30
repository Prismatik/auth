var r = require('root/lib/db_init');

// exports.getByEmail(email) {
//   db.filterBy(db.get('entities'), email);
// };

exports.get = (query, table, prop) => {
  if (!prop || !query || !table) {
    var errMsg = 'Args missing: ';
    if (!query) errMsg = errMsg + 'query '
    if (!table) errMsg = errMsg + 'table '
    if (!prop) errMsg = errMsg + 'prop.'
    throw new Error(errMsg);
  }
  return filterBy(table, prop, query)
          .run()
          .then(res => {
            if (prop === 'email' ||  prop === 'id') {
              return res[0];
            } else {
              return res;
            }
          });
};

function filterBy(table, row, query) {
  var dbQuery = r.table(table);
  if (query.type && query.entity) {
    dbQuery = dbQuery.filter(r.row(row).contains({type: query.type, entity: query.entity}));
  } else if (query.type) {
    dbQuery = dbQuery.filter(r.row(row).contains(perm => {
        return perm('type').eq(query.type);
      })
    );
  } else if (query.entity) {
    dbQuery = dbQuery.filter(r.row(row).contains(perm => {
        return perm('entity').eq(query.entity);
      })
    );
  } else {
    return dbQuery.filter(r.row(row).eq(query));
  }
  return dbQuery;
};

exports.create = (entity) => {
  return r.table('entities')
    .insert(entity, {returnChanges: true})
    .run();
};

exports.update = (entity) => {
  return r.table('entities')
    .get(entity.id)
    .update(entity, {returnChanges: true})
    .run()
    .then(res => {
      return res.changes[0].new_val;
    });
};

exports.delete = (entity) => {
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
    // TODO: return empty array if there are no perms on obj
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
