const restify = require('restify');

module.exports = (req, res, next) => {
  if (!req.authorization.basic || req.authorization.basic.password !== process.env.API_KEY) {
    return next(new restify.UnauthorizedError);
  }

  return next();
};
