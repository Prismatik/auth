var schemaValidation = require('root/routes/middleware/schema_validation');
var entity = require('root/models/entity');

exports.route = function(server) {
  server.post('/entities', schemaValidation, exports.create);
  server.get('/entities/:id', exports.read);
  server.put('/entities/:id', exports.update);
  server.del('/entities/:id', exports.delete);

  server.post('/permissions', exports.updatePermissions);
};

exports.create = function(req, res, next) {
return entity.create(req.body)
  .then(doc => {
    res.send(doc);
  })
  .catch(next);
};

exports.read = function(req, res, next) {
  return entity.getById(req.params.id)
  .then(doc => {
    res.send(doc);
  })
  .catch(next);
};

exports.update = function(req, res, next) {
  return entity.update(req.body)
  .then(doc => {
    res.send(doc);
  })
  .catch(next);
};

exports.delete = function(req, res, next) {
  return entity.delete(req.params.id)
  .then(doc => {
    res.send(doc);
  })
  .catch(next);
};

exports.updatePermissions = function(req, res, next) {
  if (req.body.action === 'add') {
    return entity.createPermission(req.params.id, req.body)
    .then(doc => {
      res.send(doc);
    })
    .catch(next);
  } else if (req.body.action === 'remove') {
    return entity.deletePermission(req.params.id)
    .then(doc => {
      res.send(doc);
    })
    .catch(next);
  }
};
