const { postToken } = require('./obtain-access-token');

// Todo: lookup auth server via Directory and OpenIdEndpoint responses.
const authorisationServerHost = async authorisationServerId =>
  (authorisationServerId ? process.env.ASPSP_AUTH_SERVER : null);

// Todo: retrieve clientCredentials from store keyed by authorisationServerId.
const clientCredentials = async authorisationServerId => (
  authorisationServerId ? {
    clientId: process.env.ASPSP_AUTH_SERVER_CLIENT_ID,
    clientSecret: process.env.ASPSP_AUTH_SERVER_CLIENT_SECRET,
  } : null);

const setupAccountRequest = async (authorisationServerId) => {
  if (!authorisationServerId) {
    const error = new Error('authorisationServerId missing from request payload');
    error.status = 400;
    throw error;
  }
  const authorizationServerHost = await authorisationServerHost(authorisationServerId);
  const { clientId, clientSecret } = await clientCredentials(authorisationServerId);
  const response = await postToken(authorizationServerHost, clientId, clientSecret);
  return response.access_token;
};

exports.setupAccountRequest = setupAccountRequest;
