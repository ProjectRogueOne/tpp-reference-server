const env = require('env-var');

const url = env
  .get('REGISTERED_REDIRECT_URL')
  .required()
  .asString();

const handler = async (req, res) => res.status(200).send();

exports.authorizationCodeGrantedUrl = url;
exports.authorizationCodeGrantedHandler = handler;
