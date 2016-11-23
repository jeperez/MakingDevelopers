// Dependencies
import redis from 'redis';

// Configuration
import { $cache } from './config';

// Utils
import { isJson, isObject } from './utils/is';
import { parseJson, stringify } from './utils/object';
import { md5 } from './utils/security';

export default (req, res, next) => {
  // Creating Redis Client
  const cacheClient = redis.createClient($cache().port, $cache().host);

  // Methods
  res.cache = {
    exists,
    expire,
    get,
    remove,
    set
  };

  function exists(key, callback) {
    cacheClient.exists(_getCacheKey(key), (error, reply) => {
      if (error) {
        console.log('Redis Error:', error); // eslint-disable-line no-console
      }

      callback(reply);
    });
  }

  function expire(key, expirationTime) {
    if (expirationTime > 0) {
      cacheClient.expire(_getCacheKey(key), expirationTime);
    } else {
      cacheClient.expire(_getCacheKey(key), $cache().expirationTime);
    }
  }

  function get(key, callback) {
    cacheClient.get(_getCacheKey(key), (error, reply) => {
      if (error) {
        console.log('Redis Error:', error); // eslint-disable-line no-console
      }

      callback(isJson(reply) ? parseJson(reply) : reply);
    });
  }

  function remove(key, callback) {
    cacheClient.del(_getCacheKey(key));
  }

  function set(key, value, expirationTime) {
    cacheClient.set(_getCacheKey(key), isObject(value) ? stringify(value) : value);

    expire(key, expirationTime);
  }

  function _getCacheKey(key) {
    return md5(key);
  }

  return next();
};
