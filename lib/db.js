var _ = require('lodash');
var r = require('root/lib/db_init');

exports.create = (table, object, id, type) => {
  return r.table(table).insert(object, {returnChanges: true}).run()
        .then(res => {
          return res;
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
    .update(entity)
    .run()
    .then(res => {
      return res;
    });
};

exports.delete = (table, id, object, type) => {
  return r.table(table).get(id).delete().run()
          .then(res => {
              return res;
            });
};
