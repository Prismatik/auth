var format = require('util').format;
var _ = require('lodash');

const REQUIRED_KEYS = ['action', 'type', 'entity', 'data'];
const PERMISSIONS = ['permission', 'inherited_permission'];

exports.find = function(operation) {
  return Promise.resolve().then(() => {
    if (!_.every(REQUIRED_KEYS, _.partial(_.has, operation))) {
      var keys = REQUIRED_KEYS.join(', ');
      var msg = format('operation must contain keys: ', keys);
      return Promise.reject(msg);
    }

    if (PERMISSIONS.indexOf(operation.type) < 0)
      return Promise.reject(format('type must be: ', PERMISSIONS.join(', ')));

    if (!exports.isUUID(operation.entity)) {
      return Promise.reject('entity must be a valid UUID');
    }
  });
}

exports.isUUID = function(uuid) {
  return new RegExp('^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$').test(uuid);
}
