const uuidv1 = require('uuid/v1'); // Timestamp based UUID
const { store } = require('./persistence.js');
const log = require('debug')('log');

const session = (() => {
  const setId = sid => store.set('session_id', sid);
  const getId = cb => store.get('session_id', cb);

  const destroy = (candidate, cb) => {
    const sessHandler = (err, sid) => {
      log(`in sessHandler sid is ${sid}`);
      if (sid !== candidate) {
        return cb(null);
      }
      store.remove('session_id'); // Async but we kinda don't care :-/
      return cb(sid);
    };
    store.get('session_id', sessHandler);
  };

  const newId = () => {
    const mySid = uuidv1();
    setId(mySid);
    return mySid;
  };

  const check = (req, res) => {
    getId((err, sid) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(sid));
      }
    });
  };

  const deleteAll = () => {
    store.deleteAll();
  };

  return {
    setId,
    getId,
    destroy,
    newId,
    check,
    deleteAll,
  };
})();

exports.session = session;
