const _ = require('lodash');
const tenants = require('root/controllers/tenants');
const setup = require('root/setup');

module.exports = (req, res, next) => {
  req.tenancy = 'entities';

  if (req.authorization.basic && req.authorization.basic.username) {
    req.tenancy = req.authorization.basic.username;
  }

  if (!_.contains(tenants.tenants, req.tenancy)) {
    setup(req.tenancy)
    .then(() => {
      return tenants.poll();
    })
    .then(() => next());
  } else {
    return next();
  }
};
