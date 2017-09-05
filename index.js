const proxy = require('express-http-proxy');
const app = require('express')();
const proxyUri = process.env.ASPSP_READWRITE_URI;
const port = process.env.PORT || 8003;
app.use('/open-banking', proxy(proxyUri));

app.listen(port);
console.log(' listening on port  ' , port);
