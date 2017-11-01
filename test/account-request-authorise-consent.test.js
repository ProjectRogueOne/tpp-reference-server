const request = require('supertest');
const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const express = require('express');
const bodyParser = require('body-parser');

const authorisationServerId = '123';

const setupApp = (setupAccountRequestStub) => {
  const { accountRequestAuthoriseConsent } = proxyquire(
    '../app/account-request-authorise-consent',
    { './setup-account-request': { setupAccountRequest: setupAccountRequestStub } },
  );
  const app = express();
  app.use(bodyParser.json());
  app.post('/account-request-authorise-consent', accountRequestAuthoriseConsent);
  return app;
};

describe('/account-request-authorise-consent with successful setupAccountRequest', () => {
  const setupAccountRequestStub = sinon.stub();
  const app = setupApp(setupAccountRequestStub);

  it('returns 204', (done) => {
    request(app)
      .post('/account-request-authorise-consent')
      .send({ authorisationServerId })
      .end((e, r) => {
        assert.equal(r.status, 204);
        const header = r.headers['access-control-allow-origin'];
        assert.equal(header, '*');
        assert(setupAccountRequestStub.calledWith(authorisationServerId));
        done();
      });
  });
});

describe('/account-request-authorise-consent with error thrown by setupAccountRequest', () => {
  const status = 403;
  const message = 'message';
  const error = new Error(message);
  error.status = status;
  const setupAccountRequestStub = sinon.stub().throws(error);
  const app = setupApp(setupAccountRequestStub);

  it('returns status from error', (done) => {
    request(app)
      .post('/account-request-authorise-consent')
      .send({ authorisationServerId })
      .end((e, r) => {
        assert.equal(r.status, status);
        assert.deepEqual(r.body, { message });
        const header = r.headers['access-control-allow-origin'];
        assert.equal(header, '*');
        assert(setupAccountRequestStub.calledWith(authorisationServerId));
        done();
      });
  });
});
