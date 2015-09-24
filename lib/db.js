var r = require('root/lib/db_init');

exports.createEntity = (entity) => {
  return r.table('entities')
      .insert(entity)
      .run();
};

exports.getEntity = (entity) => {
  return r.table('entities')
    .get(entity.id)
    .run();
};

exports.updateEntity = (entity) => {
  return r.table('entities')
    .get(entity.id)
    .update(entity)
    .run();
};

exports.deleteEntity = (entity) => {
  return r.table('entities')
    .get(entity.id)
    .delete()
    .run();
};

exports.addPermission = (entity, permission) => {
  return r.table('entities')
    .get(entity.id)
    .update({permissions: r.row('permissions').append({
      type: permission.type,
      entity: permission.entity})
    }).run();
};

exports.addInheritedPermission = (entity, permission) => {
  return r.table('entities')
    .get(entity.id)
    .update({inherited_permissions: r.row('inherited_permissions').append({
      type: permission.type,
      entity: permission.entity})
    }).run();
};

exports.getPermissions = (entity) => {
  return r.table('entities')
    .get(entity.id)('permissions')
    .run();
};

exports.removePermission = (entity, permission) => {
  return r.table('entities')
    .get(entity.id)('permissions')
    .run();
};

exports.removeInheritedPermission = (entity, permission) => {
  return r.table('entities')
    .get(entity.id)('permissions')
    .run();
};
