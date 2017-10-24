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
  const set = (key, value, cb) => {
    const cbk = cb || noop;
    if (typeof key !== 'string') throw new Error(' key must be of type String ');
    if (typeof value !== 'string') throw new Error(' value must be of type String ');
    log(`in Store Set setting key to ${key} with value ${value}`);
    client.set(key, value, 'EX', 3600); // Default to 1 hour so we don't have too many sessions stored
    return cbk();
  };

  const get = (key, cb) => {
    const cbk = cb || noop;
    // log(`in get key is ${key}`);
    if (!key) return cbk(null, null);
    return client.get(key, cbk);
  };

  const remove = key => client.del(key, noop);

  const getAll = (cb) => {
    const cbk = cb || noop;
    client.keys('*', cbk);
  };

  const deleteAll = () => client.flushall(noop);

  return {
    set,
    get,
    remove,
    getAll,
    deleteAll,
  };
})();

exports.store = store;
