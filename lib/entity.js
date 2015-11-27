'use strict';
const r = require('root/lib/r');
const restify = require('restify');
const jwt = require('jsonwebtoken');

exports.validateEmail = (req, res, next) => {
  const emails = req.body.emails;
  if (!emails) return next();

  let query = r
    .table('entities')
    .getAll(r.args(emails), { index: 'emails' })

  if (req.params.id) {
    query = query.filter(entity => entity('id').ne(req.params.id));
  }

  query
  .isEmpty()
  .run()
  .then(empty =>
    empty ? next() : next(new restify.ConflictError('emails must be unique')));
}

exports.validateRevision = (req, res, next) => {
  if (!req.body.rev) return next(new restify.BadRequestError('rev must be supplied'));
  r.table('entities')
  .get(req.params.id)
  .getField('rev')
  .eq(req.body.rev)
  .run()
  .then(equal =>
    equal ? next() : next(new restify.ConflictError('rev must be equal')));
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

exports.buildQuery = (reqQuery, reqParams) => {
  let query = r.table('entities');

  if (reqQuery.email) {
    query = r.table('entities').getAll(reqQuery.email, { index: 'emails'});
  }

  if (reqQuery.perm) {
    query = r.table('entities').getAll([reqQuery.perm.type, reqQuery.perm.entity], { index: 'permissions' });
  }

  if (reqParams.id) {
    query = query.get(reqParams.id)
  }

  return query;
}
