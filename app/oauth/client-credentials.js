const log = require('debug')('log');

const authServer = process.env.ASPSP_AUTH_ENDPOINT; // TODO - Multiple Auth Servers
log(`ASPSP_AUTH_ENDPOINT: ${authServer}`);

const getCreds = () => {
  const clientId = process.env.CLIENT_ID || 'hjThfr510OijhygTfgatGfwmmKl78adxPo0786TyyHtrFesmqnjGhdfuhunububLkojnRtR443WeVboOpOiLkoRgHbHBhF6';
  const clientSecret = process.env.CLIENT_SECRET || 'xPo0786TyyHtrFesmqnjGhdfuhunububLkhjThfr510OijhygTfgatGfwmmKl78adFojnRtR443WeVboOpOiLkoRgHbHBhF6';
  return {
    clientId,
    clientSecret,
  };
};

const authFromCreds = (id, secret) => {
  log(`id is ${id} and secret is ${secret}`);
  const auth = Buffer.from(`${id}:${secret}`).toString('base64');

  log(`Auth ${auth}`);
  return auth;
};

const getAuthorization = () => {
  const creds = getCreds();
  const Authorization = authFromCreds(creds.clientId, creds.clientSecret);
  return Authorization;
};

exports.getAuthorization = getAuthorization;
