var r = require('rethinkdb');

const HOST = 'localhost';
const PORT = 28015;
const DB_NAME = 'auth';

var connection = null;
r.connect( {host: HOST, port: PORT}, function(err, conn) {
    if (err) throw err;
    connection = conn;
});

module.exports = connection;