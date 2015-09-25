var config = require('root/config/index');

const HOST = config.RETHINK_HOST;
const PORT = config.RETHINK_PORT;
const DB_NAME = config.RETHINK_NAME;
<<<<<<< HEAD
=======
const ENTITY_TABLE_NAME = 'entities';
>>>>>>> f7ebacda3597a33dd9894ad4fda55a4bcc296b8b

module.exports = require('rethinkdbdash')({db: DB_NAME, servers: [{host: HOST, port: PORT}]});
