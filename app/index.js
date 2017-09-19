if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const express = require('express');
const { session } = require('./session');
const { proxyMiddleware } = require('./proxy.js');

const app = express();

app.use('/open-banking', proxyMiddleware);
app.use('/session/make', session.makeSession);
app.use('/session/delete', session.destroySession);
app.use('/session/check', session.check);

exports.app = app;
