const { postToken } = require('../../app/setup-account-request/obtain-access-token');
const assert = require('assert');

const nock = require('nock');

const clientId = 's6BhdRkqt3';
const clientSecret = '7Fjfp0ZBr1KtDRbnfVdmIw';
const credentials = 'Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3';

describe('Setup account request POST /token 200 response', () => {
  const response = {
    access_token: 'accessToken',
    expires_in: 3600,
    token_type: 'bearer',
    scope: 'accounts',
  };

  nock(/example\.com/)
    .post('/token')
    .matchHeader('authorization', credentials)
    .reply(200, response);

  it('returns data when 200 OK', async () => {
    const result = await postToken('http://example.com', clientId, clientSecret);
    assert.deepEqual(result, response);
  });
});

describe('Setup account request POST /token non 200 response', () => {
  nock(/example\.com/)
    .post('/token')
    .matchHeader('authorization', credentials)
    .reply(403);

  it('throws error with response status', async () => {
    try {
      await postToken('http://example.com', clientId, clientSecret);
      assert.ok(false);
    } catch (error) {
      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Forbidden');
      assert.equal(error.status, 403);
    }
  });
});

describe('Setup account request POST /token error sending request', () => {
  it('throws error with status set to 500', async () => {
    try {
      await postToken('bad-uri', clientId, clientSecret);
      assert.ok(false);
    } catch (error) {
      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'getaddrinfo ENOTFOUND bad-uri bad-uri:80');
      assert.equal(error.status, 500);
    }
  });
});
