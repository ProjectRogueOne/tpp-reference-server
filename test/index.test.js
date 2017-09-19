const request = require('supertest');

const authorization = 'abc';
const xFapiFinancialId = 'xyz';

process.env.DEBUG = 'error';
process.env.ASPSP_READWRITE_HOST = 'example.com';
process.env.AUTHORIZATION = authorization;
process.env.X_FAPI_FINANCIAL_ID = xFapiFinancialId;

const { app } = require('../app/index.js');
const { session } = require('../app/session.js');
const assert = require('assert');

const nock = require('nock');

const requestHeaders = {
  reqheaders: {
    'authorization': authorization,
    'x-fapi-financial-id': xFapiFinancialId,
  },
};

const noAuthHeaders = {
  reqheaders: {
    'authorization': '',
    'x-fapi-financial-id': xFapiFinancialId,
  },
};

nock(/example\.com/, requestHeaders)
  .get('/open-banking/v1.1/accounts')
  .reply(200, { hi: 'ya' });

nock(/example\.com/)
  .get('/open-banking/non-existing')
  .reply(404);

nock(/example\.com/, noAuthHeaders)
  .get('/open-banking/v1.1/transactions')
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
        sid = res.body.sid; // eslint-disable-line
        done();
      });
  });

  xit('destroys a valid session at /session/delete', (done) => {
    request(app)
      .get('/session/delete')
      .set('Accept', 'application/json')
      .set('authorization', sid)
      .end((err, res) => {
        assert.equal(res.body.sid, sid);
        done();
      });
  });

  it('does not destroy an invalid session at /session/delete', (done) => {
    request(app)
      .get('/session/delete')
      .set('Accept', 'application/json')
      .set('authorization', 'jkaghrtegdkhsugf')
      .end((err, res) => {
        assert.equal(res.body.sid, '');
        done();
      });
  });
});


describe('Proxy', () => {
  session.setSession('foo');

  it('returns proxy 200 response for /open-banking/v1.1/accounts with valid session', (done) => {
    request(app)
      .get('/open-banking/v1.1/accounts')
      .set('Accept', 'application/json')
      .set('authorization', 'foo')
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
      .set('authorization', 'foo')
      .end((err, res) => {
        assert.equal(res.status, 404);
        done();
      });
  });

  it('should return 404 for path != /open-banking', (done) => {
    request(app)
      .get('/open-banking-invalid')
      .set('Accept', 'application/json')
      .set('authorization', 'foo')
      .end((err, res) => {
        assert.equal(res.status, 404);
        done();
      });
  });


  xit('returns proxy 404 response for /open-banking/v1.1/accounts with invalid session', (done) => {
    request(app)
      .get('/open-banking/v1.1/transactions')
      .set('Accept', 'application/json')
      .set('authorization', 'bar')
      .end((err, res) => {
        assert.equal(res.status, 404);
        done();
      });
  });
});
