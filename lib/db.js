var _ = require('lodash');
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
          } else {
          return _.pluck(res.changes, 'new_val');
          }
        });
};

exports.get = (table, query, prop) => {
  if (!prop || !query || !table) {
    var errMsg = 'Args missing: ';
    if (!query) errMsg = errMsg + 'query ';
    if (!table) errMsg = errMsg + 'table ';
    if (!prop) errMsg = errMsg + 'prop.';
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
  var dbQuery = r.table(table).get(id);
  if (type) {
    dbQuery = dbQuery.update(row => {
      return row.merge({
        [type]: row(type).filter(function(perm) {
          return perm('entity').ne(object.entity) && perm('type').ne(object.type);
        })
      });
    }, {returnChanges: true})
  } else {
    dbQuery = dbQuery.delete({returnChanges: true});
  }
  return dbQuery.run()
          .then(res => {
              return res.changes[0].new_val;
            });
};
