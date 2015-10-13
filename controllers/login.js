'use strict';
const restify = require('restify');
const jwt = require('jsonwebtoken');
const r = require('root/lib/r');

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
    .filter(entity =>
      entity('emails').setIntersection([req.body.email]).count().gt(0))
    .nth(0);
  }

  entity.run()
  .then(entity => {
    if (!entity || entity.password !== req.body.password) {
      throw new restify.ForbiddenError('Invalid username, email or password');
    }

    const token = jwt.sign({email: entity.email, id: entity.id}, process.env.JWT_SECRET);
    res.send({token: token});
    return next();
  })
  .catch(next)
};
