const assert = require('assert');
const proxyquire = require('proxyquire');
const env = require('env-var');

const fakeUrl = 'http://localhost:999/authorized';

describe('Authorise Consent Redirection', () => {
  let redirection;

  describe('url configured', () => {
    it('returns redirection url', () => {
      redirection = proxyquire('../../app/authorization-code-granted/redirection.js', {
        'env-var': env.mock({
          REGISTERED_REDIRECT_URL: fakeUrl,
        }),
      });

      assert.equal(redirection.authorizationCodeGrantedUrl, fakeUrl);
    });
  });

  describe('url missing', () => {
    it('throws an error', () => {
      try {
        redirection = proxyquire('../../app/authorization-code-granted/redirection.js', {});
      } catch (e) {
        assert(
          e.message.match(/"REGISTERED_REDIRECT_URL" is a required variable/),
          'error message should indicate REGISTERED_REDIRECT_URL is missing',
        );
      }
    });
  });
});
