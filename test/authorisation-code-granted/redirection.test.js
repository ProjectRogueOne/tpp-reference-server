const assert = require('assert');
const proxyquire = require('proxyquire');
const env = require('env-var');
const httpMocks = require('node-mocks-http');

const fakeUrl = 'http://localhost:999/authorized';

describe('Authorized Code Granted Redirection', () => {
  let redirection;

  beforeEach(() => {
    redirection = proxyquire('../../app/authorisation-code-granted/redirection.js', {
      'env-var': env.mock({
        REGISTERED_REDIRECT_URL: fakeUrl,
      }),
    });
  });

  describe('url configured', () => {
    it('returns redirection url', () => {
      assert.equal(redirection.authorisationCodeGrantedUrl, fakeUrl);
    });

    it('handles the redirection route', () => {
      const state = 'the state';
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/authorized',
        query: {
          'authorisation-code': '12345_67xxx',
          state,
        },
      });
      const response = httpMocks.createResponse();
      redirection.authorisationCodeGrantedHandler(request, response);
      assert.equal(200, response.statusCode);
    });
  });

  describe('url missing', () => {
    it('throws an error', () => {
      try {
        redirection = proxyquire('../../app/authorisation-code-granted/redirection.js', {});
      } catch (e) {
        assert(
          e.message.match(/"REGISTERED_REDIRECT_URL" is a required variable/),
          'error message should indicate REGISTERED_REDIRECT_URL is missing',
        );
      }
    });
  });
});
