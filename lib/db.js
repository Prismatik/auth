var r = require('root/lib/db_init');

exports.create = (table, object, id, type) => {
  var dbQuery = r.table(table);
  if (type) {
    var updateObj = {};
    updateObj[type] = r.row(type).default([]).append({type: object.type, entity: object.entity});
    dbQuery = dbQuery.get(id).update(updateObj, {returnChanges: true});
  } else {
    dbQuery = dbQuery.insert(object, {returnChanges: true});
  }

  return dbQuery.run()
        .then(res => {
          if (res.changes.length === 1) {
            return res.changes[0].new_val;
          }
          var results = [];
          for (var i = 0; i < res.changes.length; i++ ) {
             results.push(res.changes[i].new_val);
          }
          return results;
        });
};

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

exports.update = (table, entity) => {
  return r.table(table)
    .get(entity.id)
    .update(entity, {returnChanges: true})
    .run()
    .then(res => {
      return res.changes[0].new_val;
    });
};

exports.delete = (table, id, object, type) => {
  var dbQuery = r.table(table);
  if (type) {
    var deleteObj = {};
    deleteObj[type] = r.row(type)
                        .filter(perm => {
                          return perm('entity').ne(object.entity) && perm('type').ne(object.type);
                        });
    dbQuery = dbQuery.update(r.row(type).merge(deleteObj), {returnChanges: true});
  } else {
    dbQuery = dbQuery.get(id).delete({returnChanges: true});
  }

  return dbQuery.run()
          .then(res => {
              return res.changes[0].new_val;
            });
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
