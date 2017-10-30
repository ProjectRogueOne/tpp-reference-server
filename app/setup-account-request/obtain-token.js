const request = require('axios');

const tokenPayload = authServerHost => ({
  url: `${authServerHost}/token`,
  method: 'POST',
  form: {
    scope: 'accounts',
    grant_type: 'client_credentials',
  },
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'authorization': 'xxx',
  },
});

const postToken = async (authServerHost) => {
  try {
    const response = await request(tokenPayload(authServerHost));
    return response.data;
  } catch (err) {
    const error = new Error(err.message);
    error.status = err.response ? err.response.status : 500;
    throw error;
  }
};

exports.postToken = postToken;
