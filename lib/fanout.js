'use strict'
const _ = require('lodash');
const r = require('./r');

const CIRCULAR_INHERITANCE = 'Circular inheritance found.';

function circularInheritanceError(type, parentId) {
  let error = new Error(CIRCULAR_INHERITANCE + ' type: ' + type + ', parent: ' + parentId);
  error.statusCode = 400;
  return error;
}

// formats permissions to use in a .getAll()
function formatPermissions(permissions) {
  return r.args(r.expr(permissions).map(p => [p('type'), p('entity')]));
}

function calculatePermissions(item, table) {
  return item('permissions').concatMap(permission =>
    r.table(table)
    .get(permission('entity'))
    .getField('inherited_permissions')
    .setUnion(
      r.table(table).get(permission('entity')).getField('permissions')
    )
    .filter(inherited => inherited('type').eq(permission('type')))
  ).distinct();
}

function getParents(permissions, table) {
  return r.table(table)
  .getAll(formatPermissions(permissions), { index: 'permissions' })
}

function checkCircularInheritance(parentPermissions, permissionsByType, itemId, table) {
  return r.table(table)
  .getAll(formatPermissions(parentPermissions), { index: 'all_permissions' })
  .pluck('id').run()
  .then(parents => {
    _.each(permissionsByType, (permIds, type) => {
      if (_.contains(permIds, itemId)) throw circularInheritanceError(type, itemId);
      _.each(parents, parent => {
        if (_.contains(permIds, parent.id)) {
          throw circularInheritanceError(type, parent.id);
        };
      });
    });
  });
}

function genParentPermissions(item, oldPermissions) {
  return _.uniq(_.map(oldPermissions, perm => ({
    type: perm.type,
    entity: item('id')
  })), 'type');
}

function fanoutPermissions(item, parentPermissions, isParent, table) {
  const newPermissions = genParentPermissions(item, parentPermissions);

  return item.update({
    inherited_permissions: calculatePermissions(item, table)
  }, { nonAtomic: true }).run()
  .then(res => {
    if (isParent && res.replaced === 0) return;
    return getParents(newPermissions, table).distinct().run()
    .then(parents => Promise.all(
      _.map(parents, parent => fanoutPermissions(r.table(table).get(parent.id), newPermissions, true, table))
    ))
  });
}

/**
 * resolvePermissions
 *
 * resolves permissions up and down the tree for the passed in item
 * and permissions
 *
 * @example
 * ```
 *
 * const item = r.table(table).get(params.id);
 * const updatedPermissions = params.permissions;
 *
 * fanout.resolvePermissions(item, updatedPermissions, table)
 * .then(() => console.log('success!'))
 * ```
 *
 * @param {string} itemId - item id to resolve permissions for
 * @param {object} updatedPermissions - new permissions array for object
 * @param {string} table - name of the rethink table to use
 * @returns {promise} Promise
 * @resolves Null - permissions sucessfully updated
 * @rejects Error - error from database or CircularInheritance error
 */

exports.resolvePermissions = (itemId, updatedPermissions, table) => {
  if (_.isEmpty(updatedPermissions)) return Promise.resolve();

  const item = r.table(table).get(itemId)

  const parentPermissions = genParentPermissions(item, updatedPermissions);

  const permissionsByType = _.reduce(updatedPermissions, (base, permission) => {
    if (!base[permission.type]) base[permission.type] = [];
    base[permission.type].push(permission.entity);
    return base;
  }, {});

  return checkCircularInheritance(parentPermissions, permissionsByType, itemId, table)
  .then(() => item.update({
    permissions: updatedPermissions
  }).run())
  .then(() => fanoutPermissions(item, parentPermissions, false, table));
}
