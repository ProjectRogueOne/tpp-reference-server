/*
POST a username and password (form encoded)
if the username and password match - create a session cookie
 */

const { session } = require('./session');
const { credentials } = require('./credentials');
const log = require('debug')('log');

/**
 * This is obviously insanely simplified and no production code should use this method
 */
const checkCredentials = (u, p) => {
  const allow = (u && p && credentials[u] && credentials[u].p === p) || false;
  return allow;
};

const login = (() => {
  const authenticate = (req, res) => {
    let sid = '';
    const { u } = req.body;
    const { p } = req.body;
    const allow = checkCredentials(u, p);
    if (allow) {
      sid = session.getNewSid();
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({ sid }));
    } else {
      res.status(401).send();
    }
  };

  const logout = (req, res) => {
    const sid = req.headers['authorization'];
    log(`in logout sid is ${sid}`);
    if (session.destroySession(sid)) {
      log(`destroying sid ${sid}`);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({ sid }));
    } else {
      res.sendStatus(204);
    }
  };

  return {
    authenticate,
    logout,
  };
})();

exports.login = login;
