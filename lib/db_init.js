var config = require('root/config/index.json');
require('required_env')(config.env);

const HOST = process.env.RETHINK_HOST;
const PORT = process.env.RETHINK_PORT;
const DB_NAME = process.env.RETHINK_NAME;

var r = require('rethinkdbdash')({db: DB_NAME, servers: [{host: HOST, port: PORT}]});

var init = () => {
  r.dbList().run()
    .then(res => {
      if (res.indexOf(DB_NAME) < 0) r.dbCreate(DB_NAME).run();
    })
    .then(()=>{
      return r.tableList().run();
    })
    .then(res => {
      if (res.indexOf('entities') < 0) r.tableCreate('entities').run();
    });
};

init();

module.exports = r;
