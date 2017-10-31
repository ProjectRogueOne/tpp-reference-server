const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('setupAccountRequest called with authorisationServerId', () => {
  const accessToken = 'access-token';
  const authServerHost = 'http://example.com';
  let setupAccountRequest;
  let postTokenStub;

  before(() => {
    process.env.ASPSP_AUTH_SERVER = authServerHost;
    postTokenStub = sinon.stub().returns({ access_token: accessToken });
    setupAccountRequest = proxyquire(  // eslint-disable-line
      '../../app/setup-account-request',
      { './obtain-access-token': { postToken: postTokenStub } },
    ).setupAccountRequest;
  });

  after(() => {
    process.env.ASPSP_AUTH_SERVER = null;
  });

  it('returns access-token from postToken call', async () => {
    const token = await setupAccountRequest('authorisationServerId');
    assert.equal(token, accessToken);
    assert(postTokenStub.calledWith(authServerHost));
  });
});
