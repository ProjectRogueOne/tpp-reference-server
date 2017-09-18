const request = require('supertest');

const authorization = 'abc';
const xFapiFinancialId = 'xyz';

process.env.DEBUG = 'error';
process.env.ASPSP_READWRITE_HOST = 'example.com';
process.env.AUTHORIZATION = authorization;
process.env.X_FAPI_FINANCIAL_ID = xFapiFinancialId;

const { app } = require('../app/index.js');
const assert = require('assert');

const nock = require('nock');

const requestHeaders = {
  reqheaders: {
    'authorization': authorization,
    'x-fapi-financial-id': xFapiFinancialId,
  },
};

nock(/example\.com/, requestHeaders)
  .get('/open-banking/v1.1/accounts')
  .reply(200, { hi: 'ya' });

nock(/example\.com/)
  .get('/open-banking/non-existing')
  .reply(404);

describe('Session Creation', () => {
  it('returns a guid in the body as a json payload for /session/make', (done) => {
    request(app)
      .get('/session/make')
      .set('Accept', 'application/json')
      .end((err, res) => {
        const mySid = res.body.sid;
        const isGuid = (mySid.length === 36);
        assert.equal(true, isGuid);
        done();
      });
  });
});


describe('Session Deletion', () => {
  let sid = '';

  before((done) => {
    request(app)
      .get('/session/make')
      .set('Accept', 'application/json')
      .end((err, res) => {
        sid = res.body.sid;
        done();
      });
  });


  it('destroys a session at /session/delete', (done) => {
    request(app)
      .get('/session/delete')
      .set('Accept', 'application/json')
      .set('authorization', sid)
      .end((err, res) => {
        const delSid = res.body.sid;
        assert.equal(delSid, sid);
        done();
      });
  });
});


describe('Proxy', () => {
  it('returns proxy 200 response for /open-banking/v1.1/accounts', (done) => {
    request(app)
      .get('/open-banking/v1.1/accounts')
      .set('Accept', 'application/json')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.hi, 'ya');
        done();
      });
  });

  it('returns proxy 404 reponse for /open-banking/non-existing', (done) => {
    request(app)
      .get('/open-banking/non-existing')
      .set('Accept', 'application/json')
      .end((err, res) => {
        assert.equal(res.status, 404);
        done();
      });
  });

  it('should return 404 for path != /open-banking', (done) => {
    request(app)
      .get('/open-banking-invalid')
      .set('Accept', 'application/json')
      .end((err, res) => {
        assert.equal(res.status, 404);
        done();
      });
  });
});
