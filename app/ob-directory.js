const request = require('axios');
const log = require('debug')('log');

const directoryHost = process.env.OB_DIRECTORY_HOST;
const accessToken = process.env.OB_DIRECTORY_ACCESS_TOKEN;

const OBAccountPaymentServiceProviders = async (req, res) => {
  try {
    const uri = `${directoryHost}/scim/v2/OBAccountPaymentServiceProviders/`;
    log(uri);
    const response = await request({
      url: uri,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    if (response.status === 200) {
      res.json(response.data);
    }
    return res.sendStatus(response.status);
  } catch (e) {
    throw e;
  }
};

exports.OBAccountPaymentServiceProviders = OBAccountPaymentServiceProviders;
