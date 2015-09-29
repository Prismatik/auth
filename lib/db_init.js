var config = require('root/config/index');

const HOST = config.RETHINK_HOST;
const PORT = config.RETHINK_PORT;
const DB_NAME = config.RETHINK_NAME;

var r = require('rethinkdbdash')({db: DB_NAME, servers: [{host: HOST, port: PORT}]});

var init = () => {
  r.tableList().run()
    .then(res => {
      if (res.indexOf('entities') < 0) r.tableCreate('entities').run();
    });
};

init();

module.exports = r;