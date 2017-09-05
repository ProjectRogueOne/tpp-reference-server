const request = require('supertest');

process.env.ASPSP_READWRITE_URI = 'example.com';
const { app } = require('../app/index.js');
const assert = require('assert');

const nock = require('nock');

nock(/example\.com/)
  .get('/')
  .reply(200, { hi: 'ya' });

nock(/example\.com/)
  .get('/non-existing')
  .reply(404);

describe('Proxy', () => {
  it('returns proxy 200 response for /open-banking', (done) => {
    request(app)
      .get('/open-banking')
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
