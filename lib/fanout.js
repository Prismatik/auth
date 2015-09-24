var entity = require('root/models/entity');
var format = require('util').format;
var _ = require('lodash');

const REQUIRED_KEYS = ['action', 'variety', 'type', 'entity'];
const PERMISSIONS = ['permission', 'inherited_permission'];
const CIRCULAR_INHERITANCE = 'Circular inheritance found.';

exports.generate = function(id, operation) {
  return Promise.resolve().then(() => {
    if (!_.every(REQUIRED_KEYS, _.partial(_.has, operation))) {
      var keys = REQUIRED_KEYS.join(', ');
      var msg = format('operation must contain keys: ', keys);
      return Promise.reject(msg);
    }

    if (PERMISSIONS.indexOf(operation.variety) < 0)
      return Promise.reject(format('type must be: ', PERMISSIONS.join(', ')));

    if (!exports.isUUID(operation.entity)) {
      return Promise.reject('entity must be a valid UUID');
    }

    var ops = [];
    return entity.get(operation.entity).then(res => {
      var perms = res.permissions;

      if (!perms.length) return exports.output(id, [operation]);

      var inherited = exports.findByType(perms, operation.type);
      if (!inherited.length) return exports.output(id, [operation]);

      ops.push(operation);

      var found = [];
      inherited.forEach(inherit => {
        found.push(entity.get(inherit.entity));

        ops.push({
          action: 'add',
          variety: 'inherited_permission',
          type: inherit.type,
          entity: inherit.entity
        });
      });

      return Promise.all(found).then(entities => {
        var err;
        entities.forEach(item => {
          var circular = exports.findByTypeAndEntity(item.permissions, operation.type, id);
          if (circular.length) err = CIRCULAR_INHERITANCE;
        });

        if (err) return Promise.reject(err);

        return exports.output(id, ops);
      });
    });
  });
}

exports.output = function(id, operations) {
  return {id: id, operations: operations};
}

exports.isUUID = function(uuid) {
  return uuid.match(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
}

exports.findByType = function(arr, type) {
  return arr.filter(item => {
    return item.type == type;
  });
}

exports.findByTypeAndEntity = function(arr, type, entity) {
  return arr.filter(item => {
    return item.type == type && item.entity == entity;
  });
}
