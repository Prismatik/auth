var server = 'http://auth.prismatik.com.au/entities';
var request = require('request-promise');

request.post({url: server, json: require('./dave.json')})
.auth('foo', "XxfGralzfsAsfXsbgkEw64bSpGMc")
.then( body => {
  console.log('body is', body);
});
