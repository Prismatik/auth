var fs = require('fs');
var parse = require('json-schema-to-markdown');
var deref = require('json-schema-deref');
var generate = require('json-schema-random');

var files = fs.readdirSync('./schemas').filter(function(file) {
  return file.substring(file.length - 5) === '.json';
});

var schemas = [];
files.forEach(function(file) {
  var schema = require('./schemas/'+file);
  schemas.push({name: file.replace('.json', ''), schema: schema});
});

schemas.forEach(function(schema) {
  deref(schema.schema, function(err, fullSchema) {
    var markdown = parse(fullSchema)
    var docPath = './schemas/'+schema.name+'.md';
    fs.writeFileSync(docPath, markdown);
    console.log('wrote doc for', schema.name, 'to', docPath);

    var generated = generate(fullSchema);
    var examplePath = './example_data/'+schema.name+'.json';
    fs.writeFileSync(examplePath, JSON.stringify(generated, null, 2));
    console.log('wrote example data for', schema.name, 'to', examplePath);
  });
});
