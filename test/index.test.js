const request = require('supertest');

const authorization = 'abc';
const xFapiFinancialId = 'xyz';

process.env.DEBUG = 'error';
process.env.ASPSP_READWRITE_HOST = 'example.com';
process.env.OB_DIRECTORY_HOST = 'http://example.com';
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

const directoryHeaders = {
  reqheaders: {
    authorization: 'Bearer undefined',
  },
};

nock(/example\.com/, directoryHeaders)
  .get('/scim/v2/OBAccountPaymentServiceProviders/')
  .reply(200, { da: 'ta' });

nock(/example\.com/, requestHeaders)
  .get('/open-banking/v1.1/accounts')
  .reply(200, { hi: 'ya' });

nock(/example\.com/)
  .get('/open-banking/non-existing')
  .reply(404);

const login = application => request(application)
  .post('/login')
  .set('Accept', 'x-www-form-urlencoded')
  .send({ u: 'alice', p: 'wonderland' });

describe('Session Creation (Login)', () => {
  it('returns "Access-Control-Allow-Origin: *" header', (done) => {
    login(app)
      .end((err, res) => {
        const header = res.headers['access-control-allow-origin'];
        assert.equal(header, '*');
        done();
      });
  });

  it('returns a guid in the body as a json payload for /login', (done) => {
    login(app)
      .end((err, res) => {
        const mySid = res.body.sid;
        const isGuid = (mySid.length === 36);
        assert.equal(true, isGuid);
        done();
      });
  });

  it('returns an unauthorised status for an invalid set of credentials at /login', (done) => {
    request(app)
      .post('/login')
      .set('Accept', 'x-www-form-urlencoded')
      .send({ u: 'foo', p: 'baarx' })
      .end((err, res) => {
        assert.equal(res.status, 401);
        done();
      });
  });

  it('returns 500 error status for username "trigger-error"', (done) => {
    request(app)
      .post('/login')
      .set('Accept', 'x-www-form-urlencoded')
      .send({ u: 'trigger-error', p: 'baarx' })
      .end((err, res) => {
        assert.equal(res.status, 500);
        done();
      });
  });
});

describe('Session Deletion (Logout)', () => {
  it('returns "Access-Control-Allow-Origin: *" header', (done) => {
    login(app).end(() => {
      request(app)
        .post('/logout')
        .end((e, r) => {
          const header = r.headers['access-control-allow-origin'];
          assert.equal(header, '*');
          done();
        });
    });
  });

  it('destroys a valid session at /logout', (done) => {
    login(app).end((err, res) => {
      const sessionId = res.body.sid;

      request(app)
        .post('/logout')
        .set('Accept', 'application/json')
        .set('authorization', sessionId)
        .end((e, r) => {
          assert.equal(r.status, 200);
          assert.equal(r.body.sid, sessionId);
          done();
        });
    });
  });

  it('does not destroy an invalid session at /logout', (done) => {
    request(app)
      .get('/logout')
      .set('Accept', 'application/json')
      .set('authorization', 'jkaghrtegdkhsugf')
      .end((err, res) => {
        assert.equal(res.status, 204);
        done();
      });
  });

  after(() => {
    session.deleteAll();
  });
});

describe('Directory', () => {
  session.setSession('foo');

  it('returns proxy 200 response for /account-payment-service-providers', (done) => {
    login(app).end((err, res) => {
      const sessionId = res.body.sid;

      request(app)
        .get('/account-payment-service-providers')
        .set('Accept', 'application/json')
        .set('authorization', sessionId)
        .end((e, r) => {
          assert.equal(r.status, 200);
          assert.equal(r.body.da, 'ta');
          const header = r.headers['access-control-allow-origin'];
          assert.equal(header, '*');
          done();
        });
    });
  });
});

describe('Proxy', () => {
  session.setSession('foo');

  it('returns proxy 200 response for /open-banking/v1.1/accounts with valid session', (done) => {
    login(app).end((err, res) => {
      const sessionId = res.body.sid;

      request(app)
        .get('/open-banking/v1.1/accounts')
        .set('Accept', 'application/json')
        .set('authorization', sessionId)
        .end((e, r) => {
          assert.equal(r.status, 200);
          assert.equal(r.body.hi, 'ya');
          done();
        });
    });
  });

  it('returns proxy 404 reponse for /open-banking/non-existing', (done) => {
    login(app).end((err, res) => {
      const sessionId = res.body.sid;
      request(app)
        .get('/open-banking/non-existing')
        .set('Accept', 'application/json')
        .set('authorization', sessionId)
        .end((e, r) => {
          assert.equal(r.status, 404);
          done();
        });
    });
  });

  it('should return 404 for path != /open-banking', (done) => {
    login(app).end((err, res) => {
      const sessionId = res.body.sid;
      request(app)
        .get('/open-banking-invalid')
        .set('Accept', 'application/json')
        .set('authorization', sessionId)
        .end((e, r) => {
          assert.equal(r.status, 404);
          done();
        });
    });
  });

  it('returns proxy 401 unauthorised response for /open-banking/* with missing authorization header', (done) => {
    login(app).end(() => {
      request(app)
        .get('/open-banking/v1.1/balances')
        .set('Accept', 'application/json')
        .end((e, r) => {
          assert.equal(r.status, 401);
          const header = r.headers['access-control-allow-origin'];
          assert.equal(header, '*');
          done();
        });
    });
  });

  it('returns proxy 401 unauthorised response for /open-banking/* with invalid authorization header', (done) => {
    login(app).end(() => {
      request(app)
        .get('/open-banking/v1.1/products')
        .set('Accept', 'application/json')
        .set('authorization', 'invalid-token')
        .end((e, r) => {
          assert.equal(r.status, 401);
          const header = r.headers['access-control-allow-origin'];
          assert.equal(header, '*');
          done();
        });
    });
  });

  after(() => {
    session.deleteAll();
  });
});
