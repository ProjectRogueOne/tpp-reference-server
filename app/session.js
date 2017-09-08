const uuidv1 = require('uuid/v1');  // Timestamp based UUID
const log = require('debug')('log');
const cookieOpts = {
  httpOnly: true,
  /* secure: true, */
  sameSite: true,
  path: '/',
  maxAge: 600000,
};

const session = (() => {

  // TODO - Persistence Store ?
  let sessionStore = {};

  const makeSession = (req, res, next) => {

    const mySid = uuidv1();
    log(' New Session ID is ' + mySid);

    sessionStore[mySid] = mySid;
    res.cookie('session', mySid, cookieOpts);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({sid: mySid}));

    return mySid;
  };

  const destroySession = (req, res, next) => {

    let opts = JSON.parse(JSON.stringify(cookieOpts));
    let sid = req.cookies && req.cookies.session;
    log(' destroying sid ' + sid);

    if (sid) {
      delete sessionStore[sid];
    }

    opts.maxAge = 0;
    opts.expires = new Date(0);
    res.cookie('session', '', opts);
    res.status(200).send('Deleted')
  };

  const checkCookies = (req, res, next) => {
    // NB Debug code to go
    log('Cookies: ', req.cookies);
    log(' Sessions ');
    log(session.getSessions());
    res.status(200).send('Cookies')
  };

  const getSessions = () => {
    log('Returning session store'); // This is here to keep eslint happy - see https://github.com/eslint/eslint/issues/5498
    return sessionStore;
  };

  return {
    checkCookies: checkCookies,
    makeSession: makeSession,
    destroySession: destroySession,
    getSessions: getSessions
  }

})();

exports.session = session;
