var config = require('root/config/index.json');
require('required_env')(config.env);

const HOST = process.env.RETHINK_HOST;
const PORT = process.env.RETHINK_PORT;
const DB_NAME = process.env.RETHINK_NAME;

module.exports = require('rethinkdbdash')({db: DB_NAME, servers: [{host: HOST, port: PORT}]});
