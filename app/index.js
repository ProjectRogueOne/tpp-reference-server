if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { requireAuthorization } = require('./authorization');
const { login } = require('./login');
const { proxyMiddleware } = require('./proxy.js');
const { OBAccountPaymentServiceProviders } = require('./ob-directory');
// const { accountRequestHandler } = require('./account-request');  // SE BELOW re Middleware
const { hybrid } = require('./flows/hybrid.js');

const app = express();
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/login', login.authenticate);
app.use('/logout', login.logout);
app.post('/account-requests', hybrid.requestAccountInfo);
app.all('/account-payment-service-provider-authorisation-servers', requireAuthorization);
app.use('/account-payment-service-provider-authorisation-servers', OBAccountPaymentServiceProviders);
app.all('/open-banking/*', requireAuthorization);
// NOTE - Temporarily Disabled until proxy plays nicely with Middleware !
// app.use('/open-banking', accountRequestHandler()); // Does STEP 2
app.use('/open-banking', proxyMiddleware);

exports.app = app;
