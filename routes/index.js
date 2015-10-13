var _ = require('lodash');
var restify = require('restify');
var jwt = require('jsonwebtoken');

module.exports = function(server) {
  server.post('/verify-token', verifyToken);

  _.invoke([
    require('root/controllers/entities'),
    require('root/controllers/login')
  ], 'route', server);
};

function verifyToken(req, res, next) {
  if (!req.body.token) return next(new restify.NotFoundError('Missing token.'));

  jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new restify.BadRequestError(err.message))
    if (!decoded.email) return next(new restify.NotFoundError('Missing email.'))

    // Note: Add entity.getByEmail or similar and return ok/error response
    // back to client.
  });
};
