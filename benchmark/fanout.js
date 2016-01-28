//const _ = require('lodash');
//const ben = require('ben');
//const fanout = require('root/lib/fanout');
//const entities = require('root/test/fixtures/entities.json');
//const r = require('root/lib/r');
//
//const table = process.env.RETHINK_TABLE;
//
//function setup() {
//  return r.tableList().contains(table).run()
//  .then(hasTable => hasTable ? r.tableDrop(table).run() : null)
//  .then(() => r.tableCreate(table).run())
//  .then(() => r.table(table).insert(_.times(5, () => ({
//    permissions: [],
//    inherited_permissions: []
//  })), { returnChanges: true }).run())
//  .then(res => _.pluck(res.changes, 'new_val'))
//}
//
//function genPermission(type, item) {
//  return {
//    type: type,
//    entity: item.id
//  };
//}
//
//function addPermission(to, type, item) {
//  const permission = genPermission(type, item);
//
//  return r.table(table).get(to.id).update(entity => ({
//    permissions: entity('permissions').append(permission)
//  })).run();
//}
//
//ben.async(done => {
//  setup().then(entities => {
//    addPermission(entities[0], 'owner', entities[1])
//    .then(() => addPermission(entities[2], 'owner', entities[3]))
//    .then(() => {
//      const permissions = [
//        genPermission('owner', entities[2])
//      ];
//
//      return fanout.resolvePermissions(entities[1].id, permissions);
//    })
//    .then(() => r.table(table).get(entities[0].id).run()
//      .then(entity => {
//        const expectedPermission = {
//          entity: entities[3].id,
//          type: 'owner'
//        };
//
//        done();
//      }));
//  });
//}, ms => {
//  console.log(ms, 'per iteration');
//});
