var jsonwebtoken = require('jsonwebtoken');
var schemaValidation = require('root/routes/middleware/schema_validation');
var config = require('root/config/index.json');

exports.route = function(server) {
  server.post('/entities', schemaValidation, exports.create);
  server.get('/entities/:id', exports.read);
  server.put('/entities/:id', exports.update);
  server.del('/entities/:id', exports.delete);

  server.post('/entities/:id/permissions', exports.addPermissions);
  server.get('/entities/:id/permissions', exports.readPermissions);
  server.del('/entities/:id/permissions', exports.removePermissions);
};

exports.create = function(req, res, next) {
  return res.send('working')
};

exports.read = function(req, res, next) {
  return res.send('working')
};

exports.update = function(req, res, next) {
  return res.send('working')
};

exports.delete = function(req, res, next) {
  return res.send('working')
};

exports.addPermissions = function(req, res, next) {
  return res.send('working')
};

exports.readPermissions = function(req, res, next) {
  return res.send('working')
};

exports.removePermissions = function(req, res, next) {
  return res.send('working')
};