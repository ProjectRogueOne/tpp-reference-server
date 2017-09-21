const uuidv1 = require('uuid/v1'); // Timestamp based UUID

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
    setSession,
    destroySession,
    getNewSid,
    check,
    getSessions,
  };
})();

exports.session = session;
