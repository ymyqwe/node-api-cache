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
const localCache = new NodeApiCache({ useNodeCache: true, useRedis: false, nodeCacheTime: 1000});
const redisCache = new NodeApiCache({ useNodeCache: false, useRedis: true, redisConfig: { uri: 'redis://localhost:6379' }, redisCacheTime: 1 });
const allCache = new NodeApiCache({ useNodeCache: true, useRedis: true, redisConfig: { uri: 'redis://localhost:6379' } });
chai.use(sinonChai);

function wait(fn, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        fn();
        resolve();
      } catch(err) {
        reject(err);
      } 
    }, delay);
  });
}

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
      expect(() => {
        localCache.set('key', 'value');
      }).to.not.throw()
    })
    
    it('should allow adding a new item to the redis cache', () => {
      expect(() => {
        redisCache.set('key', 'value');
      }).to.not.throw()
    })

    it('should allow adding a new item to the all cache', () => {
      expect(() => {
        allCache.set('key', 'value');
      }).to.not.throw()
    })


  })


  describe('get()', () => {
    it('should return null for an empty cache', async () => {
      const result = await localCache.get('miss');
      expect(result).to.be.null;
      const result1 = await redisCache.get('miss');
      expect(result1).to.be.null;
    })

    it('should return corresponding value for an non-empty cache', async () => {
      localCache.set('key1', 'value1')
      const result = await localCache.get('key1');
      expect(result).to.equal('value1');
      redisCache.set('key2', 'value2');
      const result1 = await redisCache.get('key2');
      expect(result1).to.equal('value2');
    })

    it('should return the latest corresponding value for a key in the cache', async () => {
      localCache.set('key1', 'value1');
      localCache.set('key1', 'value1-1');
      localCache.set('key1', 'value1-2');
      const result = await localCache.get('key1');
      expect(result).to.equal('value1-2');
      redisCache.set('key2', 'value2');
      redisCache.set('key2', 'value2-1');
      redisCache.set('key2', 'value2-2');
      const result1 = await redisCache.get('key2');
      expect(result1).to.equal('value2-2');
    })

    it('should handle varios types of values in local cache', async () => {
      var values = [null, undefined, NaN, true, false, 0, 1, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '', 'a', [], {}, [1, 'a', false], {a:1,b:'a',c:false}, function() {}];
      for (const [index, value] of values.entries()) {
        const key = 'key' + index;
        localCache.set(key, value);
        const result = await localCache.get(key);
        expect(result).to.deep.equal(value);
      }
    })

    it('should handle varios types of values in redis cache', async () => {
      var values = [null, true, false, 0, 1,  '', 'a', [], {}, [1, 'a', false], {a:1,b:'a',c:false}];
      for (const [index, value] of values.entries()) {
        const key = 'key' + index;
        redisCache.set(key, value);
        const result = await redisCache.get(key);
        expect(result).to.deep.equal(value);
      }
    })

    it('should return the corresponding value of a non-expired key in local cache', async () => {
      localCache.set('key', 'value');
      clock.tick(900);
      const result = await localCache.get('key');
      expect(result).to.equal('value');
    });

    it('should refresh the corresponding value of a non-expired key in local cache when revisited', async () => {
      localCache.set('key', 'value');
      clock.tick(900);
      const result = await localCache.get('key');
      expect(result).to.equal('value');
      clock.tick(900);
      const result1 = await localCache.get('key');
      expect(result1).to.equal('value');
    });
    
    it('should return null given an expired key', async () => {
      localCache.set('key', 'value');
      clock.tick(1100);
      const result = await localCache.get('key')
      expect(result).to.be.null;
    });

    it('should refresh the corresponding value of a non-expired key in local cache when revisited', async () => {
      localCache.set('key', 'value');
      clock.tick(900);
      const result = await localCache.get('key');
      expect(result).to.equal('value');
      clock.tick(1100);
      const result1 = await localCache.get('key');
      expect(result1).to.be.null;
    });


    it('should return the corresponding value of a non-expired key in redis cache', function (done) {
      this.timeout(2000)
      redisCache.set('key', 'value');
      // return wait(async () => {
      //   const result = await redisCache.get('key');
      //   expect(result).to.equal('value')
      // }, 1100)
      // await wait(1);
      // done()
      setTimeout(() => {
        redisCache.get('key').then(result => {
          console.log('resultttt', result);
          expect(result).to.equal('value');
          done()
        });
      }, 900);
    });
    
    // it('should refresh the corresponding value of a non-expired key in redis cache when revisited', async () => {
    //   redisCache.set('key', 'value');
    //   clock.tick(900);
    //   const result = await redisCache.get('key');
    //   expect(result).to.equal('value');
    //   await clock.tick(900);
    //   const result1 = await redisCache.get('key');
    //   expect(result1).to.equal('value');
    // });
    
    // it('should return null given an expired key', async () => {
    //   redisCache.set('key', 'value');

    //   const result = await redisCache.get('key')
    //   expect(result).to.be.null;
    // });

    // it('should refresh the corresponding value of a non-expired key in redis cache when revisited', async () => {
    //   redisCache.set('key', 'value');
    //   await clock.tick(900);
    //   const result = await redisCache.get('key');
    //   expect(result).to.equal('value');
    //   await clock.tick(11000);
    //   const result1 = await redisCache.get('key');
    //   expect(result1).to.be.null;
    // });
  })

  describe('clearLocalCache()', () => {
    it('should allow clear local cache', () => {
      expect(() => {
        localCache.clearLocalCache();
      }).to.not.throw();
    })
  })

});
