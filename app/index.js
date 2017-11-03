if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { session } = require('./session');
const { requireAuthorization } = require('./authorization');
const { login } = require('./login');
const { proxyMiddleware } = require('./proxy.js');
const { OBAccountPaymentServiceProviders } = require('./ob-directory');
const { accountRequestAuthoriseConsent } = require('./account-request-authorise-consent');

const app = express();
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/login', login.authenticate);
app.use('/logout', login.logout);
app.all('/account-payment-service-provider-authorisation-servers', requireAuthorization);
app.use(
  '/account-payment-service-provider-authorisation-servers',
  OBAccountPaymentServiceProviders,
);

app.all('/account-request-authorise-consent', requireAuthorization);
app.post('/account-request-authorise-consent', accountRequestAuthoriseConsent);

app.all('/open-banking/*', requireAuthorization);
app.use('/open-banking', proxyMiddleware);
app.use('/session/check', session.check);

exports.app = app;
