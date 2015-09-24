var r = require('rethinkdb');
var config = require('root/config/index');

const HOST = config.RETHINK_HOST;
const PORT = config.RETHINK_PORT;
const DB_NAME = config.RETHINK_NAME;
const ENTITY_TABLE_NAME = 'entities';

var connection = null;

r.connect( {host: HOST, port: PORT, db: DB_NAME})
  .then(conn => {
    connection = conn;
    // Create the db if it doesn't already exist.
    // r.dbList().run(conn)
    //   .then(res => {
    //     if (res.indexOf(DB_NAME) < 0)
    //       r.dbCreate('auth').run(connection)
    //         .error(console.log);
    //   // Create entity table if it doesn't already exist
    //   r.tableList().run(conn)
    //     .then(res => {
    //       if (res.indexOf(ENTITY_TABLE_NAME) < 0)
    //         r.tableCreate(ENTITY_TABLE_NAME).run(conn)
    //           .then(console.log);
      //   });
      // });
    module.exports = connection;
    console.log('exported', connection)
  })
  .error(err => {
    console.log(err);
  });
