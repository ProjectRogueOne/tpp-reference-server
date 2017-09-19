const uuidv1 = require('uuid/v1'); // Timestamp based UUID
const log = require('debug')('log');

const session = (() => {
  const sessionStore = {};

  const makeSession = (req, res) => {
    const mySid = uuidv1();
    log(` New Session ID is ${mySid}`);
    sessionStore[mySid] = mySid;

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ sid: mySid }));

    return mySid;
  };

  const destroySession = (req, res) => {
    let sid = req.headers['authorization'];
    let msg = 'No Session Deleted';

    if (sid && sessionStore[sid]) {
      log(` destroying sid ${sid}`);
      delete sessionStore[sid];
      msg = `Deleted Session ID  + ${sid}`;
    } else {
      // return res.status(204);
      sid = '';
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({ msg, sid }));
  };

  const check = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(sessionStore));
  };

  /* eslint-disable */
  const getSessions = () => {
    return sessionStore;
  };
  /* eslint-enable */

  const setSession = (sid) => {
    sessionStore[sid] = sid;
  };

  return {
    makeSession,
    destroySession,
    check,
    getSessions,
    setSession,
  };
})();

exports.session = session;
