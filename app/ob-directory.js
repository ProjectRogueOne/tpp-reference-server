const request = require('axios');
const log = require('debug')('log');
const error = require('debug')('log');

const directoryHost = process.env.OB_DIRECTORY_HOST;
const accessToken = process.env.OB_DIRECTORY_ACCESS_TOKEN;

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
    if (response.status === 200) {
      return res.json(response.data);
    }
    return res.sendStatus(response.status);
  } catch (e) {
    error(e);
    throw e;
  }
};

exports.OBAccountPaymentServiceProviders = OBAccountPaymentServiceProviders;
