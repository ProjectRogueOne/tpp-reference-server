if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const proxy = require('express-http-proxy');
const app = require('express')();
const proxyUri = process.env.ASPSP_READWRITE_HOST;
const authorization = process.env.AUTHORIZATION;
const xFapiFinancialId = process.env.X_FAPI_FINANCIAL_ID;

app.use('/open-banking', proxy(proxyUri, {
  proxyReqOptDecorator: (options, request) => {
    options.headers['authorization'] = authorization;
    options.headers['x-fapi-financial-id'] = xFapiFinancialId;
    return options;
  }
}));

exports.app = app;
