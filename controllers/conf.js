
var _ = require('underscore');

process.env.NODE_ENV = 'local';
 // process.env.NODE_ENV = 'development';
 // process.env.NODE_ENV = 'testing';
 // process.env.NODE_ENV = 'production';

var env_var;

if(process.env.NODE_ENV == 'local') {
    env_var = require('../config/local_env');
}
else if (process.env.NODE_ENV == 'development') {
    env_var = require('../config/dev_env');
}
else if (process.env.NODE_ENV == 'testing') {
    env_var = require('../config/test_env');
}
else if (process.env.NODE_ENV == 'production') {
    env_var = require('../config/prod_env');
}
else {
    return process.exit(0);
}
var config = _.extend(env_var);

module.exports = config;


