var r = require('root/lib/db_init');

exports.resetDb = () => {
  return r.table('entities')
    .delete()
    .run();
};

exports.createEntity = (entity) => {
  return r.table('entities')
    .insert(entity, {returnChanges: true})
    .run()
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

exports.getEntitiesByPermissionType = (type) => {
  return r.table('entities')
    .filter({permissions: r.row('permissions')('type').eq(type)})
    .run();
};

exports.getEntitiesByPermissionEntity = (entity) => {
  return r.table('entities')
    .get(entity_id)
    .run();
};

exports.updateEntity = (entity) => {
  // query = query.then() for fields
  return r.table('entities')
    .get(entity.id)
    .update(entity, {returnChanges: true})
    .run();
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
    .update({permissions: r.row('permissions').default([]).append({
      type: permission.type,
      entity: permission.entity})
    }, {returnChanges: true})
    .run();
};

exports.addInheritedPermission = (entity_id, permission) => {
  return r.table('entities')
    .get(entity_id)
    .update({inherited_permissions: r.row('inherited_permissions').default([]).append({
      type: permission.type,
      entity: permission.entity})
    }, {returnChanges: true})
    .run();
};

exports.getPermissions = (id) => {
  return r.table('entities')
    .get(id)('permissions')
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
