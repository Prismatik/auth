var promisify = require('promisify-node');
var jwt = promisify(require('jsonwebtoken'));
var entity = require('root/models/entity');

module.exports = function(server) {
  server.post('/verify-token', verifyToken);
};

function verifyToken(req, res, next) {
  if (!req.body.token) return res.json(404, 'Missing token.');

  jwt.verify(req.body.token, process.env.JWT_SECRET)
    .then(decoded => {
      if (!decoded.email) return res.json(404, 'Missing email.');

      // Note: Add entity.getByEmail or similar and return ok/error response
      // back to client.
      entity.getByEmail(decoded.email)
        .then(res => {
          res.json(200, 'Ok');
        });
    })
    .catch(e => res.json(400, e.message));
};
