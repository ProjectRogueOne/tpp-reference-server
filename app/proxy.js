if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const proxy = require('express-http-proxy');
const { getAuthFromSession } = require('./authorization');

const { ASPSP_READWRITE_HOST } = process.env;
const xFapiFinancialId = process.env.X_FAPI_FINANCIAL_ID;
const log = require('debug')('log');

const proxyReqPathResolver = (request) => {
  const { path } = request;
  log(`In Proxy request PATH is ${path}`);
  const newPath = (path.indexOf('open-banking') > -1) ? path : `/open-banking${path}`; // Don't rewrite twice !
  log(`In Proxy request newPath is ${newPath}`);
  return newPath;
};

const proxyReqOptDecorator = (options, req) => {
  const newOptions = options;
  const sid = req.headers.authorization;
  return new Promise((resolve) => {
    getAuthFromSession(sid, (auth) => {
      newOptions.headers['authorization'] = auth;
      newOptions.headers['x-fapi-financial-id'] = xFapiFinancialId;
      // log(`  session: ${sid}`);
      // log(`  authorization: ${auth}`);
      // log(`  x-fapi-financial-id: ${xFapiFinancialId}`);
      resolve(newOptions);
    });
  });
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
