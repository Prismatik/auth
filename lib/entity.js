'use strict';
const r = require('root/lib/r');
const restify = require('restify');
const jwt = require('jsonwebtoken');

exports.validateEmail = (req, res, next) => {
  const emails = req.body.emails;
  const table = req.tenancy || process.env.RETHINK_TABLE;
  if (!emails) return next();

  let query = r
    .table(table)
    .getAll(r.args(emails), { index: 'emails' })

  if (req.params.id) {
    query = query.filter(entity => entity('id').ne(req.params.id));
  }

  query
  .isEmpty()
  .run()
  .then(empty =>
    empty ? next() : next(new restify.ConflictError('emails must be unique'))
    , next)
}

exports.validateRevision = (req, res, next) => {
  const table = req.tenancy || process.env.RETHINK_TABLE;
  if (!req.body.rev) return next(new restify.BadRequestError('rev must be supplied'));
  r.table(table)
  .get(req.params.id)
  .getField('rev')
  .eq(req.body.rev)
  .run()
  .then(equal =>
    equal ? next() : next(new restify.ConflictError('rev must be equal'))
    , next)
}

exports.defaultEntity = {
  permissions: [],
  inherited_permissions: []
};

exports.decodeToken = (token) => new Promise((resolve, reject) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) reject(err);
    resolve(decoded);
  });
});

exports.buildQuery = (reqQuery, reqParams, table) => {
  let query = r.table(table);

  if (reqQuery.email) {
    query = r.table(table).getAll(reqQuery.email, { index: 'emails'});
  }

  if (reqQuery.perm) {
    query = r.table(table).getAll([reqQuery.perm.type, reqQuery.perm.entity], { index: 'permissions' });
  }

  if (reqParams.id) {
    query = query.get(reqParams.id)
  }

  return query;
}
