if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const proxy = require('express-http-proxy');
const { session } = require('./session');

const { ASPSP_READWRITE_HOST } = process.env;
const authorization = process.env.AUTHORIZATION;
const xFapiFinancialId = process.env.X_FAPI_FINANCIAL_ID;
const log = require('debug')('log');

/**
 * @description Only return the authorization if there is a valid session
 * @param sid
 * @returns {*}
 */
const getAuthFromSession = (sid) => {
  const sessions = session.getSessions();
  if (sid && sessions[sid] === sid) {
    return authorization;
  }
  return '';
};


const proxyReqPathResolver = (request) => {
  log(request.path);
  return `/open-banking${request.path}`;
};

const proxyReqOptDecorator = (options, req) => {
  const newOptions = options;
  const sid = req.headers.authorization;
  const auth = getAuthFromSession(sid);
  newOptions.headers['authorization'] = auth;
  newOptions.headers['x-fapi-financial-id'] = xFapiFinancialId;
  log(`  session: ${sid}`);
  log(`  authorization: ${auth}`);
  log(`  x-fapi-financial-id: ${xFapiFinancialId}`);
  return newOptions;
};

// Set body to empty string to avoid this error on r/w server:
// `Error: GET /open-banking/v1.1/accounts does not allow body content`
const proxyReqBodyDecorator = (bodyContent, srcReq) => { // eslint-disable-line
  const body = '';
  return body;
};

const proxyMiddleware = proxy(ASPSP_READWRITE_HOST, {
  proxyReqPathResolver,
  proxyReqOptDecorator,
  proxyReqBodyDecorator,
});

exports.proxyMiddleware = proxyMiddleware;
