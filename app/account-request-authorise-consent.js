const { setupAccountRequest } = require('./setup-account-request');
const error = require('debug')('error');

const accountRequestAuthoriseConsent = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { authorisationServerId } = req.body;
    await setupAccountRequest(authorisationServerId);
    return res.status(204).send();
  } catch (err) {
    error(err);
    const status = err.status ? err.status : 500;
    return res.status(status).send({ message: err.message });
  }
};

exports.accountRequestAuthoriseConsent = accountRequestAuthoriseConsent;
