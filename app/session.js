const uuidv1 = require('uuid/v1'); // Timestamp based UUID
const log = require('debug')('log');

const session = (() => {
  const sessionStore = {};

  const setSession = (sid) => {
    sessionStore[sid] = sid;
  };

  const destroySession = (sid) => {
    if (sid && sessionStore[sid]) {
      delete sessionStore[sid];
      return sid;
    }
    return null;
  };

  const getNewSid = () => {
    const mySid = uuidv1();
    setSession(mySid);
    return mySid;
  };

  const sendNewSession = (req, res) => {
    const sid = getNewSid();
    log(` New Session ID is ${sid}`);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ sid }));

    return sid;
  };

  const handleDestroySessionRequest = (req, res) => {
    let sid = req.headers['authorization'];
    let msg;

    if (destroySession(sid)) {
      log(`destroying sid ${sid}`);
      msg = `Deleted Session ID  + ${sid}`;
    } else {
      msg = 'No Session Deleted';
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

  return {
    sendNewSession,
    handleDestroySessionRequest,
    check,
    getSessions,
    setSession,
    getNewSid,
  };
})();

exports.session = session;
