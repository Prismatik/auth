var jsonwebtoken = require('jsonwebtoken');
var schemaValidation = require('root/routes/middleware/schema_validation');
var config = require('root/config/index.json');
var entity = require('root/models/entity');

exports.route = function(server) {
  server.post('/entities', schemaValidation, exports.create);
  server.get('/entities/:id', exports.read);
  server.put('/entities/:id', exports.update);
  server.del('/entities/:id', exports.delete);
};

exports.create = function(req, res, next) {
  return entity.create(req.body)
    .then(doc => {
      res.send(doc);
    })
    .catch(next);;
};

exports.read = function(req, res, next) {
    return entity.getById(req.params.id)
    .then(doc => {
      res.send(doc);
    })
    .catch(next);;
};

exports.update = function(req, res, next) {
    return entity.update(req.body)
    .then(doc => {
      res.send(doc);
    })
    .catch(next);;
};

exports.delete = function(req, res, next) {
    return entity.delete(req.params.id)
    .then(doc => {
      res.send(doc);
    })
    .catch(next);;
};

exports.createPermission = function(req, res, next) {
    return entity.createPermission(req.params.id, req.body)
    .then(doc => {
      res.send(doc);
    })
    .catch(next);;
};

exports.readPermissions = function(req, res, next) {
    return entity.getPermissions(req.params.id)
    .then(doc => {
      res.send(doc);
    })
    .catch(next);;
};

exports.deletePermission = function(req, res, next) {
    return entity.deletePermission(req.params.id)
    .then(doc => {
      res.send(doc);
    })
    .catch(next);;
};