'use strict'
const _ = require('lodash');
const r = require('./r');

const CIRCULAR_INHERITANCE = 'Circular inheritance found.';

function circularInheritanceError(type, parentId) {
  return new Error(CIRCULAR_INHERITANCE + ' type: ' + type + ', parent: ' + parentId);
}

function calculatePermissions(item) {
  return item('permissions').concatMap(permission =>
    r.table('entities')
    .get(permission('entity'))
    .getField('inherited_permissions')
    .setUnion(
      r.table('entities').get(permission('entity')).getField('permissions')
    )
    .filter(inherited => inherited('type').eq(permission('type')))
  ).distinct();
}

function getParents(permissions, item) {
  return r.table('entities')
  .filter(entity =>
    entity('permissions').setIntersection(permissions).count().gt(0));
}

function checkCircularInheritance(parentPermissions, permissionsByType, itemId) {
  return r.table('entities')
  .filter(entity =>
    // rethink's .contains() won't work here, .setIntersection() is a work around.
    entity('permissions').setIntersection(parentPermissions).count().gt(0)
    .or(entity('inherited_permissions').setIntersection(parentPermissions).count().gt(0))
  )
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

function fanoutPermissions(item, parentPermissions) {
  const newPermissions = genParentPermissions(item, parentPermissions);

  return item.update({
    inherited_permissions: calculatePermissions(item)
  }, { nonAtomic: true }).run()
  .then(() => getParents(newPermissions, item).distinct().run())
  .then(parents => Promise.all(
    _.map(parents, parent => fanoutPermissions(r.table('entities').get(parent.id), newPermissions))
  ));
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
 * const item = r.table('entities').get(params.id);
 * const updatedPermissions = params.permissions;
 *
 * fanout.resolvePermissions(item, updatedPermissions)
 * .then(() => console.log('success!'))
 * ```
 *
 * @param {string} itemId - item id to resolve permissions for
 * @param {object} updatedPermissions - new permissions array for object
 * @returns {promise} Promise
 * @resolves Null - permissions sucessfully updated
 * @rejects Error - error from database or CircularInheritance error
 */

exports.resolvePermissions = (itemId, updatedPermissions) => {
  if (_.isEmpty(updatedPermissions)) return Promise.resolve();

  const item = r.table('entities').get(itemId)

  const parentPermissions = genParentPermissions(item, updatedPermissions);

  const permissionsByType = _.reduce(updatedPermissions, (base, permission) => {
    if (!base[permission.type]) base[permission.type] = [];
    base[permission.type].push(permission.entity);
    return base;
  }, {});

  return checkCircularInheritance(parentPermissions, permissionsByType, itemId)
  .then(() => item.update({
    permissions: updatedPermissions
  }).run())
  .then(() => fanoutPermissions(item, parentPermissions));
}
