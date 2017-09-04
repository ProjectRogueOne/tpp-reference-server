let fixtures = require('./fixtures');
let users = fixtures.users;
let sessions = fixtures.sessions;
const Guid = require('guid');

const getters = (() => {

  const session = (sid) => {
    console.log(' SID ', sid);
    return sessions.byId[sid];
  };

  const userSession = (uid) => {
    console.log(' Session by UID ', uid);
    return sessions.byUser[uid];
  };

  const user = (uid) => {
    console.log(' in users users is with uid ', uid);
    console.log(users);
    return users[uid];
  };

  const newSession = (uid) => {

    let touch = Date.now();
    let guid = Guid.create();
    let sid = guid.value;

    sessions.byId[sid] = {
      user: uid,
      expires: touch + 3600000,
    };

    sessions.byUser[uid] = {
      sid: sid
    };

    let sessData = {
      user: uid,
      sid: sid,
    };
    console.log(' Made new session ');
    console.log(sessData);
    return sessData;

  };


  return {
    newSession: newSession,
    userSession: userSession,
    session: session,
    user: user
  }

})();

module.exports = getters;
