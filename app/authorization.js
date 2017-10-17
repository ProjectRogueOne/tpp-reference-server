const { session } = require('./session');

const authorization = process.env.AUTHORIZATION;

/**
 * @description Only return the authorization if there is a valid session
 * @param sid
 * @returns {*}
 */
const getAuthFromSession = (candidate, callback) => {
  session.getId((err, sid) => {
    if (sid === candidate) {
      return callback(authorization);
    }
    return callback('');
  });
};

const requireAuthorization = (req, res, next) => {
  const sid = req.headers.authorization;
  if (sid) {
    getAuthFromSession(sid, (token) => {
      if (token.length === 0) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(401).send();
      } else {
        next();
      }
    });
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(401).send();
  }
};

exports.requireAuthorization = requireAuthorization;
exports.getAuthFromSession = getAuthFromSession;
