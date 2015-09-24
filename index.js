var config = require('root/config/index.json');
require('required_env')(config.env);
require('root/lib/server').start();
