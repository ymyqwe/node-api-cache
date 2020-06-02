const NodeApiCache = require('../index');

const nowCache = new NodeApiCache({ useNodeCache: false, useRedis: true, redisConfig: { uri: 'redis://m-redis-k8s.shbeta.ke.com:36379' } });

nowCache.set('aaaaaatest', { a: 1, b: 2});

setTimeout(async () => {
  const a = await nowCache.get('aaaaaatest');
  const b = await nowCache.get('bbbbb');
  debugger;
  console.log('a,b', a, b);
}, 1000);
