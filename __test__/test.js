const NodeApiCache = require('../index');

const nowCache = new NodeApiCache({ useNodeCache: true, useRedis: false, redisConfig: { uri: 'redis://m-redis-k8s.shbeta.ke.com:36379' } });

nowCache.set('aaaaaatest', { a: 1, b: 2});

console.log('nowCache', nowCache.cache);

setTimeout(async () => {
  const a = await nowCache.get('aaaaaatest');
  nowCache.cache.get('aaaaaatest')
  const b = await nowCache.get('bbbbb');
  debugger;
  console.log('a,b', a, b);
}, 1000);
