// let fixtures = require('./fixtures');
// let users = fixtures.users;
const getters = require('./getters');
const request = require('request');

const appMain = (() => {

  const login = (req, res, next) => {

    let sessData = {};
    const params = req.body;
    const username = params.username;
    const password = params.password;

    let user = getters.user(username);
    let loggedInUser = false;

    if (user && user.user && user.user === username && user.password === password) {
      loggedInUser = user;
    }

    if (loggedInUser) {
      // is there an EXISTING session for this user ?
      sessData = getters.userSession(username);

      if (!sessData) {
        // Make new session
        sessData = getters.newSession(username);
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send({User: loggedInUser,  Session: sessData});
  };

  const session = (req, res, next) => {

    const sid = req.headers['x-session-id'].toString();
    let session = getters.session(sid);

    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send({session: session});
  };

  const getSession = (sid) => {
    return getters.session(sid);
  };

  const getUser = (uid) => {
    return getters.user(uid);
  };


  const proxy2 = (req, res, next) => {

    const sid = req.headers['x-session-id'].toString();
    let session = getters.session(sid);
    let user = session && session.user;
    console.log(' in proxy session details are ');
    console.log(session);
    console.log(user);

    if (user) {

      // Set the headers
      const headers = {
        'x-fapi-financial-id': 'abcbank',
        'Authorization': user,
        'Accept': 'application/json'
      };

      // Configure the request
      const options = {
        url: 'http://localhost:8001/open-banking/accounts',
        method: 'GET',
        headers: headers
      };

      // Start the request
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // Print out the response body
          console.log(body);
          res.setHeader('Content-Type', 'application/json');
          res.send(body);
        }
      })

    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(204);
      res.send();
    }
  };


  const proxy = (req, res, next) => {

    // const params = req.params;
    // const name = params.name;

    // Set the headers
    const headers = {
      'x-fapi-financial-id': 'abcbank',
      'Authorization': name,
      'Accept': 'application/json'
    };

    // Configure the request
    const options = {
      url: 'http://localhost:8001/open-banking/accounts',
      method: 'GET',
      headers: headers
    };

    // Start the request
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body);
        res.setHeader('Content-Type', 'application/json');
        res.send(body);
      }
    })
  };

  return {
    proxy: proxy2,
    login: login,
    session: session,
    getSession: getSession,
    getUser: getUser
  }
})();

module.exports = appMain;
