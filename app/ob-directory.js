const request = require('axios');
const nJwt = require('njwt');
const qs = require('qs');
const { session } = require('./session');
const util = require('util');
const log = require('debug')('log');
const error = require('debug')('error');
const { getAll, set } = require('./storage');

const AUTH_SERVER_COLLECTION = 'aspspAuthorisationServers';

const directoryHost = process.env.OB_DIRECTORY_HOST;
const directoryAuthHost = process.env.OB_DIRECTORY_AUTH_HOST;
const softwareStatementId = process.env.SOFTWARE_STATEMENT_ID;
const softwareStatementAssertionKid = process.env.SOFTWARE_STATEMENT_ASSERTION_KID;
const authClientScopes = process.env.CLIENT_SCOPES;
const signingKeyUrl = process.env.DEMO_ONLY_PRIVATE_KEY_URL;

log(`OB_DIRECTORY_HOST: ${directoryHost}`);

const getSessionAccessToken = util.promisify(session.getAccessToken);

const sortByName = (list) => {
  list.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    } else if (a.name > b.name) {
      return -1;
    }
    return 0;
  });
  return list;
};

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

const extractAuthorisationServers = (data) => {
  if (!data.Resources) {
    return [];
  }
  const authServers = data.Resources
    .filter(resource => !!resource.AuthorisationServers)
    .map(resource => resource.AuthorisationServers.map((r) => {
      r.orgId = resource.id; // eslint-disable-line
      return r;
    }))
    .reduce((a, b) => a.concat(b), []); // flatten array
  return authServers;
};

const storeAuthorisationServers = async (list) => {
  await Promise.all(list.map(async (item) => {
    const id = `${item.orgId}-${item.BaseApiDNSUri}`;
    await set(AUTH_SERVER_COLLECTION, item, id);
  }));
};

const storedAuthorisationServers = async () => {
  try {
    const list = await getAll(AUTH_SERVER_COLLECTION);
    if (!list) {
      return [];
    }
    const servers = list.map(s => transformServerData(s));
    return sortByName(servers);
  } catch (e) {
    error(e);
    return [];
  }
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

const fetchOBAccountPaymentServiceProviders = async () => {
  try {
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
      const authServers = extractAuthorisationServers(response.data);
      log(`data: ${JSON.stringify(authServers)}`);
      await storeAuthorisationServers(authServers);
      return storedAuthorisationServers();
    }
    return [];
  } catch (e) {
    error(e);
    return [];
  }
};

const OBAccountPaymentServiceProviders = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let servers = storedAuthorisationServers();
  if (servers.length > 0) {
    fetchOBAccountPaymentServiceProviders(); // async update store
  } else {
    servers = await fetchOBAccountPaymentServiceProviders();
  }
  return res.json(servers);
};

exports.OBAccountPaymentServiceProviders = OBAccountPaymentServiceProviders;
exports.AUTH_SERVER_COLLECTION = AUTH_SERVER_COLLECTION;
