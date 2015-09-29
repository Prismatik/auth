var r = require('root/lib/db_init');
var _ = require('lodash');

// This is a test helper method
exports.resetDb = () => {
  return r.table('entities')
    .delete()
    .run();
};

exports.filterEntitiesByPermissions = (entities, permission) => {
  return _.filter(entities, function(entity) {
    return _.any(entity.permissions, function(perm) {
      if (permission.type && permission.entity)
        return perm.type === permission.type && perm.entity === permission.entity;
      else if (permission.type)
        return perm.type === permission.type;
      else if (permission.entity)
        return perm.entity === permission.entity;
    });
  });
};