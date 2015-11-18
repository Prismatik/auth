const r = require('root/lib/r');

module.exports = function setUp() {
  return r.dbCreate(process.env.RETHINK_NAME).run()
  .catch((err) => {
    var arr = err.message.split('\n');
    if (arr[0] === 'Database `'+process.env.RETHINK_NAME+'` already exists in:') return;
    throw err;
  })
  .then(() => r.tableCreate('entities').run())
  .catch((err) => {
    if (err.message.split('\n')[0] === 'Table `auth.entities` already exists in:') return;
    throw err;
  })
  .then(() => r.table('entities').indexCreate('emails', { multi: true }).run())
  .catch(err => {
    if (err.message.indexOf('Index `emails` already exists') > -1 )return;
    throw err;
  })
  .then(() => r.table('entities').indexWait('emails').run())
}
