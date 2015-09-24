var config = require('root/config/index');

const HOST = config.RETHINK_HOST;
const PORT = config.RETHINK_PORT;
const DB_NAME = config.RETHINK_NAME;
const ENTITY_TABLE_NAME = 'entities';

module.exports = require('rethinkdbdash')({db: DB_NAME, servers: [{host: HOST, port: PORT}]});
