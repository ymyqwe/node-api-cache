const Redis = require('ioredis');

const redisClient = (config) => {
  if (!config) throw new Error('You should config your redis client');
  const { keyPrefix = 'node:' } = config;
  if (config.uri || config.url) {
    return new Redis(config.uri || config.url, { keyPrefix });
  }
  return new Redis(config, { keyPrefix });
};

module.exports = redisClient;
