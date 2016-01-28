var restify = require('restify');
var pckage = require('root/package.json');
var basicAuth = require('root/routes/middleware/basic_auth');
var tenancy = require('root/routes/middleware/tenancy');

var server = restify.createServer({name: pckage.name});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(basicAuth);
server.use(tenancy);

require('root/routes')(server);

module.exports = server;
