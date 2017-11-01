const request = require('superagent');

const postToken = async (authorisationServerHost) => {
  try {
    const response = await request
      .post(`${authorisationServerHost}/token`)
      .set('authorization', 'xxx')
      .type('form') // e.g. 'content-type': 'application/x-www-form-urlencoded'
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
