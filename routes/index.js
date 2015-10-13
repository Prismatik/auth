
var _ = require('lodash');
var promisify = require('promisify-node');
var jwt = promisify(require('jsonwebtoken'));

module.exports = function(server) {
  server.post('/verify-token', verifyToken);

  _.invoke([
    require('root/controllers/entities')
  ], 'route', server);

};

function verifyToken(req, res, next) {
  if (!req.body.token) return res.json(404, 'Missing token.');

  jwt.verify(req.body.token, process.env.JWT_SECRET)
    .then(decoded => {
      if (!decoded.email) return res.json(404, 'Missing email.');

      // Note: Add entity.getByEmail or similar and return ok/error response
      // back to client.
    })
    .catch(e => res.json(400, e.message));
};
