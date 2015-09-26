// var db = require('root/lib/db');


exports.create = (entity) => {
  return db.createEntity(entity);
};

exports.getById = (id) => {
  return db.getEntity(id);
};

exports.getByEmail = (email) => {
  return db.getEntityByEmail(email);
};

exports.getByPermission = (permission) => {
  if (permission.type && permission.entity)
    return db.getEntitiesByPermission;
  else if (permission.type)
    return db.getEntitiesByPermissionType;
  else if (permission.entity)
    return db.getEntitiesByPermissionEntity;
};

exports.update = (entity) => {
  return db.updateEntity(entity);
};

exports.getPermissions = (id) => {
  return db.getPermissions(id);
};

exports.addPermission = (id, permission) => {
  return db.addPermission(id, permission);
};

exports.addInheritedPermission = (id, permission) => {
  return db.addInheritedPermission(id, permission);
};

exports.removePermission = (id, permission) => {
  return db.removePermission(id, permission);
};

exports.removeInheritedPermission = (id, permission) => {
  return db.removeInheritedPermission(id, permission);
};

exports.delete = (id) => {
  return db.deleteEntity(id);
};