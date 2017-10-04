const request = require('axios');
const log = require('debug')('log');
const error = require('debug')('log');

const directoryHost = process.env.OB_DIRECTORY_HOST;
const accessToken = process.env.OB_DIRECTORY_ACCESS_TOKEN;

log(`OB_DIRECTORY_HOST: ${directoryHost}`);

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

const OBAccountPaymentServiceProviders = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
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
