const cache = require('./cache');
const redisClient = require('./redis');
/*
  @params
  useNodeCache: whether use local node cache;
  nodeCacheTime: the local cache expired time (in millisecond), default is 10 minutes;
  useRedis: whether to use redis to store your cache;
  redisConfig: the redis configuration;
  redisCacheTime: the redis cache expires time (in second), default is 3 hours
*/
const NodeApiCache = function NodeApiCache(config) {
  this.init = () => {
    const {
      useNodeCache, nodeCacheTime = 10 * 60 * 1000, useRedis, redisConfig, redisCacheTime = 60 * 60 * 3,
    } = config;
    this.redis = null;

    // at least one cache strategy should be configured
    if (!useNodeCache && !useRedis) {
      throw new Error('You should use at least one cache type');
    }

    // mount properties on this
    if (useRedis) {
      this.redis = redisClient(redisConfig);
    }
    this.useNodeCache = useNodeCache;
    this.nodeCacheTime = nodeCacheTime;
    this.useRedis = useRedis;
    this.cache = cache;
    this.redisCacheTime = redisCacheTime;
  };

  this.set = (key, value) => {
    if (this.useRedis) {
      let redisValue = value;
      // when storing in redis, value
      // transfer object to string
      if (typeof value === 'object') {
        redisValue = JSON.stringify(value);
      }
      this.redis.set(key, redisValue, 'EX', this.redisCacheTime);
    }
    this.cache.put(key, value, this.nodeCacheTime);
  };

  this.get = async (key) => {
    let result = null;

    if (this.useNodeCache && this.cache.get(key)) {
      result = this.cache.get(key);
      console.log('get local cache', key, result);
      if (result) this.set(key, result);
      return Promise.resolve(result);
    }

    if (this.useRedis) {
      result = await this.redis.get(key);
      // handle stringify object
      try {
        result = JSON.parse(result);
      } catch (error) {
        console.log('error', error);
      }
      console.log('get redis cache', key, typeof result);
      if (result) this.set(key, result);
      return result;
    }
    // return promise
    return Promise.resolve(result);
  };

  this.clearLocalCache = () => {
    this.cache.clear();
    console.log('All node cache cleared');
  };


  this.init();
};


module.exports = NodeApiCache;
