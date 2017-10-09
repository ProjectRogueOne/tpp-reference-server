const request = require('axios');
const log = require('debug')('log');
const error = require('debug')('log');
const { getAll, set } = require('./storage');

const AUTH_SERVER_COLLECTION = 'aspspAuthorisationServers';

const directoryHost = process.env.OB_DIRECTORY_HOST;
const accessToken = process.env.OB_DIRECTORY_ACCESS_TOKEN;

log(`OB_DIRECTORY_HOST: ${directoryHost}`);

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

const extractAuthServers = (data) => {
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

const storeAuthServers = async (list) => {
  await Promise.all(list.map(async (item) => {
    const id = `${item.orgId}-${item.BaseApiDNSUri}`;
    await set(AUTH_SERVER_COLLECTION, item, id);
  }));
};

const fetchOBAccountPaymentServiceProviders = async () => {
  try {
    const uri = `${directoryHost}/scim/v2/OBAccountPaymentServiceProviders/`;
    const bearerToken = `Bearer ${accessToken}`;
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
      const authServers = extractAuthServers(response.data);
      await storeAuthServers(authServers);
      log(`data: ${JSON.stringify(authServers)}`);
      const list = await getAll(AUTH_SERVER_COLLECTION);
      const servers = list.map(s => transformServerData(s));
      return servers;
    }
    return null;
  } catch (e) {
    error(e);
    return null;
  }
};

const OBAccountPaymentServiceProviders = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const servers = await fetchOBAccountPaymentServiceProviders();
  if (servers) {
    return res.json(sortByName(servers));
  }
  return res.sendStatus(404);
};

exports.OBAccountPaymentServiceProviders = OBAccountPaymentServiceProviders;
