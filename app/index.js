if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { session } = require('./session');
const { login } = require('./login');
const { proxyMiddleware } = require('./proxy.js');

const app = express();
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/login', login.authenticate);
app.use('/logout', login.logout);
app.use('/open-banking', proxyMiddleware);
app.use('/session/check', session.check);

exports.app = app;
