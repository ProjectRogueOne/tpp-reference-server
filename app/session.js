const uuidv1 = require('uuid/v1'); // Timestamp based UUID
const { store } = require('./persistence.js');
const log = require('debug')('log');

const session = (() => {
  const setSession = (sid) => {
    store.setSession(sid, sid);
  };

  const destroySession = (sid, cb) => {
    const sessHandler = (err, reply) => {
      log(`in sessHandler reply is ${reply}`);
      if (reply) {
        store.delSession(reply); // Async but we kinda don't care :-/
        return cb(reply);
      }
      return cb(null);
    };
    store.getSession(sid, sessHandler);
  };

  const getNewSid = () => {
    const mySid = uuidv1();
    setSession(mySid);
    return mySid;
  };

  /* eslint-disable */
  const getSessions = (cb) => {
    store.getAllSessions((err, res) => {
      const sess = {};
      if (res && res.length) {
        res.map((sid) => sess[sid] = sid)
      }
      cb(err, sess)
    });
  };
  /* eslint-enable */

  const check = (req, res) => {
    getSessions((err, sessions) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(sessions));
      }
    });
  };

  const deleteAll = () => {
    store.deleteAll();
  };

  return {
    setSession,
    destroySession,
    getNewSid,
    check,
    getSessions,
    deleteAll,
  };
})();

exports.session = session;
