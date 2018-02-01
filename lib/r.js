var config = require('root/config/index.json');
require('required_env')(config.env);

const HOST = process.env.RETHINK_HOST;
const PORT = process.env.RETHINK_PORT;
const DB_NAME = process.env.RETHINK_NAME;
const USERNAME = process.env.RETHINK_USERNAME;
const PASSWORD = process.env.RETHINK_PASSWORD;

var r = require('rethinkdbdash')({
  db: DB_NAME,
  username: USERNAME,
  password: PASSWORD,
  servers: [{host: HOST, port: PORT}],
});

module.exports = r;
