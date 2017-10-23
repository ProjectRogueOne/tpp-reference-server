/*
Hybrid Flow
PSU Requests Data
*/

// Step 1 PSU Requests Account Information
// Step 2 Setup Account Request
// Step 3 Authorise Consent
// Step 4 Request Data
const log = require('debug')('log');
const { getAuthorization } = require('../oauth/client-credentials.js');
const requestPromise = require('request-promise-native');
const uuidv1 = require('uuid/v1');

const { ASPSP_READWRITE_HOST } = process.env;
const accountRequestEndpoint = `${ASPSP_READWRITE_HOST}/account-requests`;
const aspspAuthEndpoint = process.env.ASPSP_AUTH_ENDPOINT; // TODO - Refactor

const requestHelpers = (() => {
  const getInteractionId = () => {
    // TODO - Proper Implementation !
    const uuid = uuidv1();
    log(` new UUID for Cust Interaction ID is ${uuid}`);
    return uuid;
  };

  const fapiHeaders = () => {
    const d = new Date(Date.now() - (1000 * 3600 * 24 * 7));
    const lastLogin = `${d.toISOString().slice(0, -5)}00:00`;
    return {
      'x-fapi-financial-id': 'abcbank',
      'x-fapi-customer-last-logged-time': lastLogin,
      'x-fapi-customer-ip-address': 'x192.168.0.1',
      'x-fapi-customer-interaction-id': getInteractionId(),
    };
  };
  return { fapiHeaders };
})();

const Step1PsuReqAccountInfo = (() => {
  /**
   * This is the code that takes the Account Information Request
   * from the Client and then kicks off the Account Request
   */
  const getAccountInfo = (a, b) => new Promise((resolve, reject) => {
    if (a === b) { // TODO - proper implemetation!
      resolve('Success');
    } else {
      reject(new Error('Something went wrong'));
    }
  });

  return {
    getAccountInfo,
  };
})();

const Step2SetupAccountRequest = (() => {
  /**
   * TODO - Implementation
   */
  const establishAuthMATLS = (a, b) => new Promise((resolve, reject) => {
    if (a === 'auth matls' && b === 1.2) { // TODO - proper implemetation!
      resolve('AUTH MATLS Channel Established');
    } else {
      reject(new Error('Something went wrong'));
    }
  });

  const initiateClientCredentialsGrant = () => {
    // https://openbanking.atlassian.net/wiki/spaces/WOR/pages/4297946/1.+Open+Banking+Security+Profile+-+v1.0.0#id-1.OpenBankingSecurityProfile-v1.0.0-AccountAPISpecification
    // ... OR ... https://openbanking.atlassian.net/wiki/spaces/WOR/pages/7046134/1.+Open+Banking+Security+Profile+-+Implementer+s+Draft+v1.1
    const auth = getAuthorization();

    const options = {
      method: 'POST',
      uri: aspspAuthEndpoint,
      form: {
        scope: 'accounts',
        grant_type: 'client_credentials',
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': auth,
      },
    };
    return requestPromise(options);
  };

  /**
   * DUMMY FUNCTION
   * @param a
   * @param b
   */
  const establishResourceMATLS = (a, b) => new Promise((resolve, reject) => {
    if (a === 'resource matls' && b === 1.2) { // TODO - proper implemetation!
      resolve('Resource MATLS Channel Established');
    } else {
      reject(new Error('Something went wrong'));
    }
  });


  const buildAccountRequestData = () => {
    // Build Date Strings
    const d = new Date();
    const expiration = `${d.toISOString().slice(0, -5)}00:00`;
    d.setFullYear(d.getFullYear() - 1);
    const from = `${d.toISOString().slice(0, -5)}00:00`;

    return {
      Data: {
        Permissions: [
          'ReadAccountsDetail',
          'ReadBalances',
          'ReadBeneficiariesDetail',
          'ReadDirectDebits',
          'ReadProducts',
          'ReadStandingOrdersDetail',
          'ReadTransactionsCredits',
          'ReadTransactionsDebits',
          'ReadTransactionsDetail',
        ],
        ExpirationDateTime: expiration,
        TransactionFromDateTime: from,
        TransactionToDateTime: expiration,
      },
    };
  };

  const getAccountRequestId = (accessToken) => {
    const requestBody = buildAccountRequestData();
    const fapiHeaders = requestHelpers.fapiHeaders();
    const otherHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
    // Get Headers
    const options = {
      method: 'POST',
      uri: accountRequestEndpoint,
      body: requestBody,
      json: true,
      headers: Object.assign(otherHeaders, fapiHeaders),
    };
    return requestPromise(options);
  };

  return {
    establishAuthMATLS,
    initiateClientCredentialsGrant,
    establishResourceMATLS,
    getAccountRequestId,
  };
})();


const requestAccountInfo = (req, res) => {
  let authMatls;
  let accountIdReq;

  // DO we have a valid session ID ?
  // If so what is the session info ?
  // proxyReqOptDecorator

  Step1PsuReqAccountInfo.getAccountInfo(1, 1)
    .then((response) => {
      // Establish Mutual TLS with the Authorization Server - spoof
      if (response === 'Success') {
        authMatls = Step2SetupAccountRequest.establishAuthMATLS('auth matls', 1.2);
      }
      if (authMatls) {
        authMatls.then((matlsResp) => {
          if (matlsResp === 'AUTH MATLS Channel Established') {
            // Get Client Credentials Grant
            Step2SetupAccountRequest.initiateClientCredentialsGrant()
              .then((accessTokenString) => {
                const accessTokenObj = JSON.parse(accessTokenString);
                const accessToken = accessTokenObj.access_token;

                // Establish Mutual TLS with the Resource Server- spoof
                Step2SetupAccountRequest.establishResourceMATLS('resource matls', 1.2)
                  .then(() => {
                    // Send the Account Request Request
                    Step2SetupAccountRequest.getAccountRequestId(accessToken)
                      .then((accountRequestResult) => {
                        accountIdReq = accountRequestResult
                          && accountRequestResult.Data
                          && accountRequestResult.Data.AccountRequestId;
                        res.status(201).json({ accountRequestId: accountIdReq });
                        // TODO - Kick off Account Requests
                        // TODO - Implement Redirect for PSU to give consent
                      })
                      .catch((err) => {
                        log(err);
                        res.sendStatus(401);
                      });
                  });
              })
              .catch((err) => {
                log(err);
                res.sendStatus(400);
              });
          }
        });
      }
    });
};

const hybrid = {
  Step1PsuReqAccountInfo,
  Step2SetupAccountRequest,
  requestAccountInfo,
};

exports.hybrid = hybrid;
