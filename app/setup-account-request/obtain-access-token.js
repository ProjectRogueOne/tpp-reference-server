const request = require('superagent');

// Use Basic Authentication Scheme: https://tools.ietf.org/html/rfc2617#section-2
const credentials = (userid, password) => {
  const basicCredentials = Buffer.from(`${userid}:${password}`).toString('base64');
  return `Basic ${basicCredentials}`;
};

/*
 * For now only support Client Credentials Grant Type (OAuth 2.0):
 * https://tools.ietf.org/html/rfc6749#section-4.4
 *
 * Assume authentication using a client_id and client_secret:
 * https://tools.ietf.org/html/rfc6749#section-2.3
 */
const postToken = async (authorisationServerHost, clientId, clientSecret) => {
  try {
    const response = await request
      .post(`${authorisationServerHost}/token`)
      .set('authorization', credentials(clientId, clientSecret))
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        scope: 'accounts',
        grant_type: 'client_credentials',
      });
    return response.body;
  } catch (err) {
    const error = new Error(err.message);
    error.status = err.response ? err.response.status : 500;
    throw error;
  }
};

exports.postToken = postToken;
