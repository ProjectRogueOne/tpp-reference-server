const proxy = require('express-http-proxy');
const app = require('express')();
const proxyUri = process.env.ASPSP_READWRITE_URI;

app.use('/open-banking', proxy(proxyUri));

exports.app = app;
