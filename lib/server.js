var restify = require('restify');
var pckage = require('root/package.json');;
var server;

exports.NOT_STARTED = 'Server not started.';

exports.start = function(port) {
  server = restify.createServer({name: pckage.name});

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  require('root/routes')(server);

  return new Promise((resolve) => {
    server.listen(port || process.env.PORT, () => {

      if (process.env.NODE_ENV != 'test')
        console.log('%s listening at %s', server.name, server.url);

      return resolve(server);
    });
  });
};

exports.end = function() {
  return new Promise((resolve, reject) => {

    if (!server)
      return reject(new restify.InternalServerError(exports.NOT_STARTED));

    server.close(() => {
      server = null;
      return resolve(server);
    });
  });
};
