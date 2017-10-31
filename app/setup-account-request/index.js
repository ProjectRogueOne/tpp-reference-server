const { postToken } = require('./obtain-access-token');

// Todo: lookup auth server via Directory and OpenIdEndpoint responses.
const authorisationServerHost = async authorisationServerId =>
  (authorisationServerId ? process.env.ASPSP_AUTH_SERVER : null);

const setupAccountRequest = async (authorisationServerId) => {
  const authorizationServerHost = await authorisationServerHost(authorisationServerId);
  const response = await postToken(authorizationServerHost);
  return response.access_token;
};

exports.setupAccountRequest = setupAccountRequest;
