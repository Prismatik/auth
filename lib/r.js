var config = require('root/config/index.json');
require('required_env')(config.env);

const HOST = process.env.RETHINK_HOST;
const PORT = process.env.RETHINK_PORT;
const DB_NAME = process.env.RETHINK_NAME;

var r = require('rethinkdbdash')({db: DB_NAME, servers: [{host: HOST, port: PORT}]});

//FIXME this is a race condition. The first time the server is started against a new DB cluster, any requests that are served before this has occurred will fail.
r.dbCreate(process.env.RETHINK_NAME).run()
.catch((err) => {
  var arr = err.message.split('\n');
  if (arr[0] === 'Database `'+process.env.RETHINK_NAME+'` already exists in:') return;
  throw err;
})
.then(() => r.tableCreate('entities').run())
.catch((err) => {
  if (err.message.split('\n')[0] === 'Table `auth.entities` already exists in:') return;
  throw err;
});

module.exports = r;
