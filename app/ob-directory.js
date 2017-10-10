const request = require('axios');
const nJwt = require('njwt');
const qs = require('qs');
const { session } = require('./session');
const util = require('util');
const log = require('debug')('log');
const error = require('debug')('log');

const directoryHost = process.env.OB_DIRECTORY_HOST;
const directoryAuthHost = process.env.OB_DIRECTORY_AUTH_HOST;
const softwareStatementId = process.env.SOFTWARE_STATEMENT_ID;
const softwareStatementAssertionKid = process.env.KID;
const authClientScopes = process.env.CLIENT_SCOPES;
const signingKeyUrl = process.env.DEMO_ONLY_PRIVATE_KEY_URL;

log(`OB_DIRECTORY_HOST: ${directoryHost}`);

const getSessionAccessToken = util.promisify(session.getAccessToken);

const transformServerData = (data) => {
  const id = data.BaseApiDNSUri;
  const logoUri = data.CustomerFriendlyLogoUri;
  const name = data.CustomerFriendlyName;
  const { orgId } = data;
  return {
    id,
    logoUri,
    name,
    orgId,
  };
};

const transformResourcesData = (data) => {
  if (!data.Resources) {
    return [];
  }
  return data.Resources
    .filter(resource => !!resource.AuthorisationServers)
    .map(resource => resource.AuthorisationServers.map((r) => {
      r.orgId = resource.id; // eslint-disable-line
      return r;
    }))
    .reduce((a, b) => a.concat(b), []) // flatten array
    .map(s => transformServerData(s));
};

const getAccessToken = async () => {
  try {
    let accessToken = JSON.parse(await getSessionAccessToken());
    if (accessToken && accessToken.expiresAt < new Date().getTime()) {
      return accessToken;
    }

    const authUrl = `${directoryAuthHost}/as/token.oauth2`;
    const claims = {
      iss: softwareStatementId,
      sub: softwareStatementId,
      scope: authClientScopes,
      aud: authUrl,
    };

    const signingKey = (await request.get(signingKeyUrl)).data;
    const createdJwt = nJwt.create(claims, signingKey, 'RS256');
    createdJwt.setHeader('kid', softwareStatementAssertionKid);
    const compactedJwt = createdJwt.compact();

    const response = await request({
      url: authUrl,
      method: 'POST',
      data: qs.stringify({
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        grant_type: 'client_credentials',
        client_id: softwareStatementId,
        client_assertion: compactedJwt,
        scope: authClientScopes,
      }),
    });

    const token = response.data.access_token;
    const tokenType = response.data.token_type;
    const tokenExpiry = parseInt(response.data.expires_in, 10);
    const tokenExpiresAt = new Date().getTime() + (tokenExpiry * 1000);

    accessToken = { token, tokenType, tokenExpiresAt };
    session.setAccessToken(accessToken);

    return accessToken;
  } catch (e) {
    error(e);
    throw e;
  }
};

const OBAccountPaymentServiceProviders = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const uri = `${directoryHost}/scim/v2/OBAccountPaymentServiceProviders/`;
    const accessToken = await getAccessToken();
    const bearerToken = `Bearer ${accessToken.token}`;
    log(`getting: ${uri}`);
    const response = await request({
      url: uri,
      method: 'GET',
      headers: {
        Authorization: bearerToken,
        Accept: 'application/json',
      },
    });
    log(`response: ${response.status}`);
    if (response.status === 200) {
      const transformed = transformResourcesData(response.data);
      log(`data: ${JSON.stringify(transformed)}`);
      return res.json(transformed);
    }
    return res.sendStatus(response.status);
  } catch (e) {
    error(e);
    throw e;
  }
};

exports.OBAccountPaymentServiceProviders = OBAccountPaymentServiceProviders;
exports.getAccessToken = getAccessToken;
