var format = require('util').format;
var jsonSchema = require('json-schema-validator');
var schema = require('root/schemas/entity.json');

const ERROR_MSG = 'Field %s has a %s error.';

module.exports = function(req, res, next) {
  var props = {url: req.url, method: req.method};

  jsonSchema.validate(schema, props, req.body)
    .then(next)
    .catch((e) => {
      res.send(400, formatErrors(e.fields));
    });
};

function formatErrors(errors) {
  return errors.map(e => format(ERROR_MSG, e.path, e.keyword));
}
