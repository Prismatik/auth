var r = require('rethinkdb');
var config = ('root/config/index');
// var connection = require('root/lib/db_init');


// Note: I've moved this into this file
// because the module.exports = connection
// may have not been exporting correctly.
// I'm not sure if it's that and/or the
// blocking connection.
const HOST = config.RETHINK_HOST;
const PORT = config.RETHINK_PORT;
const DB_NAME = config.RETHINK_NAME;
const ENTITY_TABLE_NAME = 'entities';

var connection = null;

r.connect( {host: HOST, port: PORT, db: DB_NAME})
  .then(conn => {
    connection = conn;
  })
  .error(err => {
    console.log(err);
  });

/// END db_init


exports.createEntity = (entity) => {
  if (!entity) return false;
  return new Promise((resolve, reject) => {
    r.table('entities')
      .insert(entity)
      .run(connection, (err, res) =>{
        if (err) return reject(err);
        return resolve(res);
      });
  });
};

exports.getEntity = (entity) => {
  return new Promise((resolve, reject) => {
    r.table('entities')
      .get(entity.id)
      .run(connection, (err, res) =>{
        if (err) return reject(err);
        return resolve(res);
      });
  });
};

exports.updateEntity = (entity) => {
  return new Promise((resolve, reject) => {
    r.table('entities')
      .get(entity.id)
      .update(entity)
      .run(connection, (err, res) =>{
        if (err) return reject(err);
        return resolve(res);
      });
  });
};

exports.deleteEntity = (entity) => {
  return new Promise((resolve, reject) => {
    r.table('entities')
      .get(entity.id)
      .delete()
      .run(connection, (err, res) =>{
        if (err) return reject(err);
        return resolve(res);
      });
  });
};

exports.addPermission = (entity, permission) => {
  return new Promise((resolve, reject) => {
    r.table('entities')
      .get(entity.id)
      .update({permissions: r.row('permissions').append({
        type: permission.type,
        entity: permission.entity})
      })
      .run(connection, (err, res) =>{
        if (err) return reject(err);
        return resolve(res);
      });
  });
};

exports.addInheritedPermission = (entity, permission) => {
  return new Promise((resolve, reject) => {
    r.table('entities')
      .get(entity.id)
      .update({inherited_permissions: r.row('inherited_permissions').append({
        type: permission.type,
        entity: permission.entity})
      })
      .run(connection, (err, res) =>{
        if (err) return reject(err);
        return resolve(res);
      });
  });
};

exports.getPermissions = (entity) => {
  return new Promise((resolve, reject) => {
    r.table('entities')
      .get(entity.id)('permissions')
      .run(connection, (err, res) =>{
        if (err) return reject(err);
        return resolve(res);
      });
  });
};

exports.removePermission = (entity, permission) => {
  return new Promise((resolve, reject) => {
    r.table('entities')
      .get(entity.id)('permissions')
      .run(connection, (err, res) =>{
        if (err) return reject(err);
        return resolve(res);
      });
  });
};

exports.removeInheritedPermission = (entity, permission) => {
  return new Promise((resolve, reject) => {
    r.table('entities')
      .get(entity.id)('permissions')
      .run(connection, (err, res) =>{
        if (err) return reject(err);
        return resolve(res);
      });
  });
};
