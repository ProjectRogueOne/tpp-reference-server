const assert = require('assert');
const proxyquire = require('proxyquire');
const env = require('env-var');

const fakeUrl = 'http://localhost:999/authorized';

describe('Authorise Consent Redirection', () => {
  let redirection;

  describe('url configured', () => {
    it('returns redirection url', () => {
      redirection = proxyquire('../../app/authorise-consent/redirection', {
        'env-var': env.mock({
          REGISTERED_REDIRECT_URL: fakeUrl,
        }),
      });

      assert.equal(redirection.url, fakeUrl);
    });
  });

  describe('url missing', () => {
    it('throws an error', () => {
      try {
        redirection = proxyquire('../../app/authorise-consent/redirection', {});
      } catch (e) {
        assert(
          e.message.match(/"REGISTERED_REDIRECT_URL" is a required variable/),
          'error message should indicate REGISTERED_REDIRECT_URL is missing',
        );
      }
    });
  });
});
