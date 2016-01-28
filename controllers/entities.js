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
  const table = req.tenancy || process.env.RETHINK_TABLE;

  // create entity first before attempting to resolve permissions
  var entityBody = _.assign({}, req.body, Entity.defaultEntity);
  var currentTime = (new Date()).toISOString();

  entityBody.created_at = currentTime;
  entityBody.updated_at = currentTime;
  entityBody.rev = uuid.v4();

  if (entityBody.password && !entityBody.password_hash) entityBody.password = bcrypt.hashSync(entityBody.password, 10);
  if (entityBody.password_hash) entityBody.password = entityBody.password_hash;
  delete entityBody.password_hash;

  //TODO: this is pretty ugly. Could use a refactor
  var dbQuery;

  if (entityBody.emails) {
    dbQuery = r.table(table).indexWait('emails').do(() => { // Must wait for the index to be ready, otherwise it's a race condition to write the entity, then write a second before the index updates
      return r.table(table).getAll(r.args(entityBody.emails), { index: 'emails' }).count().do(count => {
        return r.branch(
          count.eq(0),
          r.table(table).insert(entityBody, { returnChanges: true }),
          r.error('emails must be unique')
        )
      })
    })
  } else {
    dbQuery = r.table(table).insert(entityBody, { returnChanges: true });
  }
  dbQuery.then(result => {
    if (result.errors > 0) return next(result.first_error);
    return result.changes[0].new_val;
  })
  .then(entity => fanout.resolvePermissions(entity.id, req.body.permissions, table)
    .then(() => r.table(table).get(entity.id).without('password'))
    .then(entity => res.send(entity))
  )
  .then(() => next())
  .catch(next);
};

exports.read = function(req, res, next) {
  const table = req.tenancy || process.env.RETHINK_TABLE;

  Entity.buildQuery(req.query, req.params, table).run()
  .then(entity => {
    if (!entity) return next(new restify.NotFoundError('Entity not found'));
    delete entity.password;
    res.send(entity);
    return next()
  })
  .catch(next);
};

exports.getAll = function(req, res, next) {
  const table = req.tenancy || process.env.RETHINK_TABLE;

  if (req.query.token) {
    return Entity.decodeToken(req.query.token)
    .then(decoded =>
      r.table(table).getAll(decoded.email, { index: 'emails' }).run())
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

  Entity.buildQuery(req.query, req.params, table).without('password').run()
  .then(entities => res.send(entities))
  .catch(next);
};

exports.update = function(req, res, next) {
  const table = req.tenancy || process.env.RETHINK_TABLE;

  //TODO: Should check for email uniqueness here as well as on creation
  fanout.resolvePermissions(req.params.id, req.body.permissions, table)
  .then(() => {
    // inherited_permissions are server-generated and blocked from consumer input
    var updatedEntity = _.omit(req.body, 'inherited_permissions');

    if (updatedEntity.password && !updatedEntity.password_hash) updatedEntity.password = bcrypt.hashSync(updatedEntity.password, 10);
    if (updatedEntity.password_hash) updatedEntity.password = updatedEntity.password_hash;
    delete updatedEntity.password_hash;

    updatedEntity.updated_at = (new Date()).toISOString();
    updatedEntity.rev = uuid.v4();
    return updatedEntity;
  })
  .then(updatedEntity => {
    return r.table(table)
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
