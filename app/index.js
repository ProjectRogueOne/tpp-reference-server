if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { session } = require('./session');
const { requireAuthorization } = require('./authorization');
const { login } = require('./login');
const { proxyMiddleware } = require('./proxy.js');
const { OBAccountPaymentServiceProviders } = require('./ob-directory');

const app = express();
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/login', login.authenticate);
app.use('/logout', login.logout);
app.all('/open-banking/*', requireAuthorization);
app.use('/open-banking', proxyMiddleware);
app.all('/account-payment-service-providers', requireAuthorization);
app.use('/account-payment-service-providers', OBAccountPaymentServiceProviders);
app.use('/session/check', session.check);

exports.app = app;
