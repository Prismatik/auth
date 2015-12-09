var restify = require('restify');
var schemaValidation = require('root/routes/middleware/schema_validation');
var r = require('root/lib/r');
var bcrypt = require('root/lib/bcrypt');
const uuid = require('node-uuid')
const fanout = require('root/lib/fanout');
const _ = require('lodash');
const Entity = require('root/lib/entity');

exports.route = function(server) {
  server.post('/entities', Entity.validateEmail, exports.create);
  server.get('/entities', exports.getAll);
  server.get('/entities/:id', exports.read);
  server.post('/entities/:id', Entity.validateEmail, Entity.validateRevision, exports.update);
};

exports.create = function(req, res, next) {
  // create entity first before attempting to resolve permissions
  var entityBody = _.assign({}, req.body, Entity.defaultEntity);
  var currentTime = (new Date()).toISOString();

  entityBody.created_at = currentTime;
  entityBody.updated_at = currentTime;
  entityBody.rev = uuid.v4();

  if (entityBody.password && !entityBody.password_hash) entityBody.password = bcrypt.hashSync(entityBody.password, 10);
  if (entityBody.password_hash) entityBody.password = entityBody.password_hash;
  delete entityBody.password_hash;

  return r.table('entities').insert(entityBody, { returnChanges: true })
  .then(result => {
    if (result.errors > 0) return next(result.first_error);
    return result.changes[0].new_val;
  })
  .then(entity => fanout.resolvePermissions(entity.id, req.body.permissions)
    .then(() => r.table('entities').get(entity.id).without('password'))
    .then(entity => res.send(entity))
  )
  .then(() => next())
  .catch(next);
};

exports.read = function(req, res, next) {
  Entity.buildQuery(req.query, req.params).run()
  .then(entity => {
    if (!entity) return next(new restify.NotFoundError('Entity not found'));
    delete entity.password;
    res.send(entity);
    return next()
  })
  .catch(next);
};

exports.getAll = function(req, res, next) {
  if (req.query.token) {
    return Entity.decodeToken(req.query.token)
    .then(decoded =>
      r.table('entities').getAll(decoded.email, { index: 'emails' }).run())
    .then(entities => {
      return entities.map(ent => {
        delete ent.password;
        return ent;
      });
    })
    .then(entities => {
      if (!entities || entities.length === 0) {
        res.send(404);
      } else {
        res.send(entities)
      };
      return next();
    })
    .catch((e) => {
      if (e.name === 'TokenExpiredError') return next(new restify.UnauthorizedError('Token Expired'));
      next(new restify.ForbiddenError('Invalid Token'));
    });
  }

  Entity.buildQuery(req.query, req.params).without('password').run()
  .then(entities => res.send(entities))
  .catch(next);
};

exports.update = function(req, res, next) {
  fanout.resolvePermissions(req.params.id, req.body.permissions)
  .then(() => {
    // inherited_permissions are server-generated and blocked from consumer input
    var updatedEntity = _.omit(req.body, 'inherited_permissions');

    updatedEntity.updated_at = (new Date()).toISOString();
    updatedEntity.rev = uuid.v4();
    return updatedEntity;
  })
  .then(updatedEntity => {
    return r.table('entities')
    .get(req.params.id)
    .update(updatedEntity, { returnChanges: true })
    .run();
  })
  .then(result => {
    if (result.errors > 0) return next(result.first_error);
    delete result.changes[0].new_val.password;
    res.send(result.changes[0].new_val);
    return next();
  })
  .catch(next);
};
