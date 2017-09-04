let users = {

  alice: {
    user: 'alice',
    password: 'factor',
    name: 'Alice Liddell'
  },
  bob: {
    user: 'bob',
    password: 'fish',
    name: 'Bob Fish',
  },
  kevin: {
    user: 'kevin',
    password: 'bacon',
    name: 'Kevin Bacon'
  }

};

let sessions = {
  "byId": {},
  "byUser": {}
};

module.exports.users = users;
module.exports.sessions = sessions;
