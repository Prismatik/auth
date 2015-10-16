var _ = require('lodash');
var restify = require('restify');
var jwt = require('jsonwebtoken');

module.exports = function(server) {
  _.invoke([
    require('root/controllers/entities'),
    require('root/controllers/login')
  ], 'route', server);
};
