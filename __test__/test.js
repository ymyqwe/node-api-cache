const KoaCache = require('../index');

const nowCache = new KoaCache({ useNodeCache: true, useRedis: true, redisConfig: { uri: 'redis://m-redis-k8s.shbeta.ke.com:36379' } });

nowCache.set('aaaaaatest', 'hahaheihei');

setTimeout(async () => {
  const a = await nowCache.get('aaaaaatest');
  const b = await nowCache.get('bbbbb');
  debugger;
  console.log('a,b', a, b);
}, 1000);
