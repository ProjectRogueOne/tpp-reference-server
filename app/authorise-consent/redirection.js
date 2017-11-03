const env = require('env-var');

const url = env
  .get('REGISTERED_REDIRECT_URL')
  .required()
  .asString();

exports.url = url;
