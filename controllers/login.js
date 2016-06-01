'use strict';
const restify = require('restify');
const jwt = require('jsonwebtoken');
const r = require('root/lib/r');
const _ = require('lodash');
const bcrypt = require('root/lib/bcrypt');

const jwtInclusions = process.env.JWT_INCLUSIONS.split(',');

exports.route = function(server) {
  server.post('/login', exports.login);
};

exports.login = (req, res, next) => {
  if (!(req.body.id || req.body.email)  || !req.body.password) {
    return next(new restify.ForbiddenError('Invalid username, email or password'));
  }

  let entity = r.table('entities');

  if (req.body.id) {
    entity = entity.get(req.body.id);
  } else {
    entity = entity
    .getAll(req.body.email, { index: 'emails' })
    .limit(1);
  }

  entity.run()
  .then(entities => {
    let entity = entities;
    if (Array.isArray(entities)) {
      entity = entities[0];
    }
    if (!entity) {
      throw new restify.ForbiddenError('Invalid username');
    }

    return bcrypt.compareAsync(req.body.password, entity.password)
    .catch( err => {
      if (err) throw new restify.InternalServerError('Error checking password');
    })
    .then( match => {
      if (!match) throw new restify.ForbiddenError('Invalid password');

      const email = _.contains(entity.emails, req.body.email) ?
        req.body.email
        : entity.emails[0];

      const tokenData = _.pick(_.assign({email: email}, entity), jwtInclusions);
      const token = jwt.sign(tokenData, process.env.JWT_SECRET);
      res.send({token: token});
      return next();
    })
  })
  .catch(next)
};
