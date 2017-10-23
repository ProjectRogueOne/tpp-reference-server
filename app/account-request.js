const log = require('debug')('log');
const requestPromise = require('request-promise-native');

const loopbackHost = process.env.LOOPBACK_HOST || '';

let acctRefId = false; // SPOOF instead of Persistence like mongo

// Get the PSU from the session for storage of WHO owns the AccontRequestId
const getPsuIdFromSid = (sid, cb) => {
  log(` retrieving PSU ID from SID ${sid}`);
  return cb('alice');
};

const getAccountRequestIdFromStorage = (psuId, cb) => {
  log(`Retrieving Account Request ID for PSU ${psuId}`);
  // Do some Mongo Stuff ...
  return cb(acctRefId); // Spoof Failure
};

const storeNewAccountRequestId = (psuId, accountRequestId) => {
  // Spoof function to store account request ID
  log(`Storing Account Request ID ${accountRequestId} against PSU id ${psuId}`);
  acctRefId = accountRequestId;
};

const accountRequestHandler = () => {
  log('Constructor for Account Request Handler (options could be passed in here');
  return (req, res, next) => {
    const { path } = req;
    if (path === '/v1.1/accounts') {
      const sid = req.headers.authorization;
      getPsuIdFromSid(sid, (psuId) => {
        // Get the Account Request ID
        getAccountRequestIdFromStorage(psuId, (accountRequestId) => {
          if (accountRequestId) {
            log(`we HAVE an existing account request ID ${accountRequestId}`);
            return next();
          }
          const options = {
            method: 'POST',
            uri: `${loopbackHost}/account-requests`,
            headers: {
              Authorization: sid,
              Accept: 'application/json',
            },
          };
          requestPromise(options)
            .then((body) => {
              const data = JSON.parse(body);
              const newAccountRequestId = data.accountRequestId;
              storeNewAccountRequestId(psuId, newAccountRequestId);
            })
            .catch((err) => {
              log(' Err is ');
              log(err);
            });
          return next();
        });
      });
    }
    // NOT /accounts path so we just drop to next level of middleware
    return next();
  };
};

exports.accountRequestHandler = accountRequestHandler;
