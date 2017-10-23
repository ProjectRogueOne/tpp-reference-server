const { hybrid } = require('../app/flows/hybrid.js');
const assert = require('assert');

const step1 = hybrid.Step1PsuReqAccountInfo;
const step2 = hybrid.Step2SetupAccountRequest;

describe('Step 1 Request Account Information', () => {
  it(' Performs a Successful getAccountInfo ', (done) => {
    step1.getAccountInfo(2, 2)
      .then((res) => {
        assert.equal(res, 'Success');
        done();
      });
  });

  xit(' Performs an Unsuccessful getAccountInfo and receives a promise rejection error', (done) => {
    // TODO - fix broken test :-(
    step1.getAccountInfo(3, 5)
      .catch((_, err) => {
        assert.equal(err, new Error('Something went wrong'));
        done();
      })
      .then(() => {
      });
  });
});

describe('Step 2 Setup Account Request', () => {
  it(' AUTH MATLS1.2 is setup correctly ', (done) => {
    step2.establishAuthMATLS('auth matls', 1.2)
      .then((res) => {
        assert.equal(res, 'AUTH MATLS Channel Established');
        done();
      });
  });

  it(' Client Credentials Grant call returns a promis ', () => {
    const ccg = step2.initiateClientCredentialsGrant();
    assert.equal(typeof ccg, 'object');
    assert.equal(typeof ccg.then, 'function');
  });

  it(' Resource MATLS1.2 is setup correctly ', (done) => {
    step2.establishResourceMATLS('resource matls', 1.2)
      .then((res) => {
        assert.equal(res, 'Resource MATLS Channel Established');
        done();
      });
  });
});
