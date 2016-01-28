const r = require('root/lib/r');

module.exports = {
  tenants: [process.env.RETHINK_TABLE]
}

module.exports.poll = () => {
  return r.tableList().run()
  .then(tables => {
    module.exports.tenants = tables;
    return tables;
  });
};

module.exports.stopPolling = () => {
  clearInterval(poll);
};

const poll = setInterval(module.exports.poll, process.env.TENANT_POLL_INTERVAL);
