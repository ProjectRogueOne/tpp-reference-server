const assert = require('assert');
const proxyquire = require('proxyquire');
const env = require('env-var');

const fakeUrl = 'http://localhost:999/authorized';

describe('Authorise Consent Redirection', () => {
  let redirection;

  before(() => {
    redirection = proxyquire('../../app/authorise-consent/redirection', {
      'env-var': env.mock({
        REGISTERED_REDIRECT_URL: fakeUrl,
      }),
    });
  });

  describe('url', () => {
    it('exposes configured redirection url', () => {
      assert.equal(redirection.url, fakeUrl);
    });
  });
});
