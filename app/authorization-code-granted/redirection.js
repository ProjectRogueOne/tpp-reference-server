const env = require('env-var');

const url = env
  .get('REGISTERED_REDIRECT_URL')
  .required()
  .asString();

// const handler = async (req, res) => res.status(200).send();
const handler = async (req, res) => undefined;

exports.authorizationCodeGrantedUrl = url;
exports.authorizationCodeGrantedHandler = handler;