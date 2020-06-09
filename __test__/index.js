var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  clock;

const Redis = require('ioredis');

const redisClient = (config) => {
  if (!config) throw new Error('You should config your redis client');
  const { keyPrefix = 'node:' } = config;
  if (config.uri || config.url) {
    return new Redis(config.uri || config.url, { keyPrefix });
  }
  return new Redis(config, { keyPrefix });
};

const NodeApiCache = require('../index');
const localCache = new NodeApiCache({ useNodeCache: true, useRedis: false, nodeCacheTime: 60 * 1000});
const redisCache = new NodeApiCache({ useNodeCache: false, useRedis: true, redisConfig: { uri: 'redis://localhost:6379' } });
const allCache = new NodeApiCache({ useNodeCache: true, useRedis: true, redisConfig: { uri: 'redis://localhost:6379' } });
chai.use(sinonChai);

describe('node-api-cache', () => {
  beforeEach(function() {
    clock = sinon.useFakeTimers();

  });

  afterEach(function() {
    clock.restore();
  });

  describe('set config', () => {
    it('should use at least one cache', () => {
      expect(() => {
        const nowCache = new NodeApiCache({ useNodeCache: false, useRedis: false, redisConfig: { uri: 'redis://localhost:6379' } });
      }).to.throw()
    })

    it('should provide redisConfig when using redisCache', () => {
      expect(() => {
        const nowCache = new NodeApiCache({ useNodeCache: false, useRedis: true });
      }).to.throw()
    })

    it('normal api cache usage', () => {
      expect(() => {
        const Cache1 = new NodeApiCache({ useNodeCache: true, useRedis: true, redisConfig: { uri: 'redis://localhost:6379' } });
        const Cache2 = new NodeApiCache({ useNodeCache: false, useRedis: true, redisConfig: { uri: 'redis://localhost:6379' } });
        const Cache3 = new NodeApiCache({ useNodeCache: true, useRedis: false});
      }).to.not.throw()
    })
  })

  describe('set()', () => {
    it('should allow adding a new item to the local cache', () => {
      localCache.set('key', 'value');
    }).to.not.throw()
    
    it('should allow adding a new item to the redis cache', () => {
      redisCache.set('key', 'value');
    }).to.not.throw()

    it('should allow adding a new item to the all cache', () => {
      allCache.set('key', 'value');
    }).to.not.throw()


  })


  describe('get()', () => {

  })

  describe('clearLocalCache()', () => {
    
  })

});
