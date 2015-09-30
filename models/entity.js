var db = require('root/lib/db');


exports.create = (entity) => {
  return db.create(entity);
};

exports.getById = (id) => {
  return db.get(id, 'entities', 'id');
};

exports.getByEmail = (email) => {
  return db.get(email, 'entities', 'email');
};

exports.getByPermission = (permission) => {
  return db.get(permission, 'entities', 'permissions');
};

exports.update = (entity) => {
  return db.update(entity);
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

exports.delete = (entity) => {
  return db.delete(entity);
};