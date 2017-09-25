const redis = require('redis');
const log = require('debug')('log');
const url = require('url');

let redisPort = process.env.REDIS_PORT || 6379;
let redisHost = process.env.REDIS_HOST || 'localhost';
let client;

if (process.env.REDISTOGO_URL) {
  const rtg = url.parse(process.env.REDISTOGO_URL);
  redisPort = rtg.port;
  redisHost = rtg.hostname;
  client = redis.createClient(redisPort, redisHost);
  client.auth(rtg.auth.split(':')[1]);
} else {
  client = redis.createClient(redisPort, redisHost);
}

const noop = () => {};

client.on('error', (err) => {
  log(`Redis Client Error ${err}`);
});

const store = (() => {
  const setSession = (sid, value, cb) => {
    const cbk = cb || noop;
    if (typeof sid !== 'string') throw new Error(' sid must be string ');
    if (typeof value !== 'string') throw new Error(' value must be string ');
    log(`setting sid to ${sid} with value ${value}`);
    client.set(sid, value, 'EX', 3600); // Default to 1 hour so we don't have too many sessions stored
    return cbk();
  };

  const getSession = (sid, cb) => {
    log(`in get session sid is ${sid}`);
    client.get(sid, cb);
  };

  const delSession = (sid) => {
    client.del(sid);
  };

  const getAllSessions = (cb) => {
    client.keys('*', cb);
  };

  const deleteAll = () => {
    client.flushall();
  };

  return {
    setSession,
    getSession,
    delSession,
    getAllSessions,
    deleteAll,
  };
})();

exports.store = store;
