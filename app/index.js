if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const proxy = require('express-http-proxy');
const app = require('express')();

const proxyToHost = process.env.ASPSP_READWRITE_HOST;
const authorization = process.env.AUTHORIZATION;
const xFapiFinancialId = process.env.X_FAPI_FINANCIAL_ID;

const log = require('debug')('log');

app.use('/open-banking', proxy(proxyToHost, {
  proxyReqPathResolver: (request) => {
    log(request.path);
    return `/open-banking${request.path}`;
  },
  proxyReqOptDecorator: (options) => {
    const newOptions = options;
    newOptions.headers['authorization'] = authorization;
    newOptions.headers['x-fapi-financial-id'] = xFapiFinancialId;
    return newOptions;
  },
}));

exports.app = app;
