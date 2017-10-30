const { postToken } = require('../../app/setup-account-request/obtain-token.js');
const assert = require('assert');

const nock = require('nock');

describe('Setup account request POST /token 200 response', () => {
  const response = {
    access_token: 'accessToken',
    expires_in: 3600,
    token_type: 'bearer',
    scope: 'accounts',
  };

  nock(/example\.com/)
    .post('/token')
    .reply(200, response);

  it('returns data when 200 OK', async () => {
    const result = await postToken('http://example.com');
    assert.deepEqual(result, response);
  });
});

describe('Setup account request POST /token non 200 response', () => {
  nock(/example\.com/)
    .post('/token')
    .reply(403);

  it('throws error with response status', async () => {
    try {
      await postToken('http://example.com');
      assert.ok(false);
    } catch (error) {
      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Request failed with status code 403');
      assert.equal(error.status, 403);
    }
  });
});

describe('Setup account request POST /token error sending request', () => {
  it('throws error with status set to 500', async () => {
    try {
      await postToken('bad-uri');
      assert.ok(false);
    } catch (error) {
      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'connect ECONNREFUSED 127.0.0.1:80');
      assert.equal(error.status, 500);
    }
  });
});
