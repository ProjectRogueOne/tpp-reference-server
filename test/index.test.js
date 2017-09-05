const request = require('supertest');
const assert = require('assert');

const app = require('../index.js').app;
console.log(' Eels !');
describe('Proxy', function () {
  process.env.ASPSP_READWRITE_URI = 'example.com';
  it('should call a stubbed endpoint ', function (done) {

    request(app)
      .get('/open-banking')
      .expect(200)
      .end((err, res) => {
        done();
      });

  });

});
