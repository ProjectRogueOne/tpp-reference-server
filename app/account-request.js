const log = require('debug')('log');
const requestPromise = require('request-promise-native');
const requestPromise2 = require('request-promise-native');

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


const redoAccountsRequest = (req, res, next) => {
  /*
  Accept:application/json
 Accept-Encoding:gzip, deflate, br
 Accept-Language:en-GB,en-US;q=0.8,en;q=0.6,ms;q=0.4
 Authorization:f0bfce70-b94a-11e7-8956-b70e779df9ca
 Connection:keep-alive
 Host:localhost:8003
 If-None-Match:W/"218-xwcQsR8jkqubXAczomT67wTCn5o"
 Origin:http://localhost:8080
 Referer:http://localhost:8080/accounts
  x-fapi-financial-id:abcbank
   */
  const accountReq = {
    method: 'GET',
    uri: `${loopbackHost}/open-banking/v1.1/accounts`,
    headers: {
      'Authorization': req.headers.authorization,
      'Accept': 'application/json',
      'x-fapi-financial-id': req.headers['x-fapi-financial-id'],
      'x-passthru': 'true',
    },
  };

  log('---- Resend Accounts Request ');
  log(accountReq);

  setTimeout(() => {
    requestPromise2(accountReq)
      .then((body) => {
        log(' In Passthru Thingie the body is ');
        log(typeof body);
        log(body);
        res.status(200).send(body);
      })
      .catch((err) => {
        log(' Err is ');
        log(err);
        res.sendStatus(400);
      });
  }, 15);
};


const accountRequestHandler = () => {
  log('Constructor for Account Request Handler (options could be passed in here');
  return (req, res, next) => {
    const { path } = req;
    const passthru = !!req.headers['x-passthru'];
    log(`** Passthru is ${passthru} and typeof is ${typeof passthru}`);
    if (path === '/v1.1/accounts' && !passthru) {
      log(`In accountRequestHandler passthru is ${passthru}`);
      const sid = req.headers.authorization;
      getPsuIdFromSid(sid, (psuId) => {
        // Get the Account Request ID
        getAccountRequestIdFromStorage(psuId, (accountRequestId) => {
          if (accountRequestId) {
            log(`we HAVE an existing account request ID ${accountRequestId}`);
            return next();
          }
          log('we DO NOT HAVE an existing account request ID');
          // This code path calls out to the aspsp mock server
          // re-makes the /accounts request
          // and passes back the result via the result object
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
              log('Redoing Accounts Request ');
              redoAccountsRequest(req, res, next); // Remake Accounts Request
            })
            .catch((err) => {
              log(' Err is ');
              log(err);
            });
          // return {};
          return next(); // do NOT invoke next here - execution ends with res.send
        });
      });
    }
    // NOT /accounts path so we just drop to next level of middleware
    return next();
  };
};

exports.accountRequestHandler = accountRequestHandler;
