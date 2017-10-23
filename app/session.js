const uuidv1 = require('uuid/v1'); // Timestamp based UUID
const { store } = require('./persistence.js');
// const log = require('debug')('log');

const session = (() => {
  const setSession = (key, value) => store.set(key, value);
  const getSession = (sid, cb) => {
    store.get(sid, cb);
  };
  const setId = sid => store.set(sid, JSON.stringify({ sessionId: sid }));
  const getId = (sid, cb) => store.get(sid, cb);
  const setAccessToken = accessToken => store.set('ob_directory_access_token', JSON.stringify(accessToken));
  const getAccessToken = cb => store.get('ob_directory_access_token', cb);

  const destroy = (candidate, cb) => {
    const sessHandler = (err, sid) => {
      // log(`in sessHandler sid is ${sid}`);
      if (sid !== candidate) {
        return cb(null);
      }
      store.remove(candidate); // Async but we kinda don't care :-/
      return cb(sid);
    };
    store.get(candidate, sessHandler);
  };

  const newId = () => {
    const mySid = uuidv1();
    setId(mySid);
    return mySid;
  };

  const deleteAll = () => {
    store.deleteAll();
  };

  return {
    setSession,
    getSession,
    setId,
    getId,
    setAccessToken,
    getAccessToken,
    destroy,
    newId,
    deleteAll,
  };
})();

exports.session = session;
