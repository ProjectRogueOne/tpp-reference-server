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
    const cbk = cb || noop;
    log(`in get session sid is ${sid}`);
    if (!sid) return cbk(null, null);
    return client.get(sid, cbk);
  };

  const delSession = (sid) => {
    client.del(sid, noop);
  };

  const getAllSessions = (cb) => {
    const cbk = cb || noop;
    client.keys('*', cbk);
  };

  const deleteAll = () => {
    client.flushall(noop);
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
