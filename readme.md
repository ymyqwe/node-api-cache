# node-api-cache

A simple tool for generate cache for node.js

## Get started

## Usage

```javascript
const NodeApiCache = require('node-api-cache');
const cacheClient = new NodeApiCache({
  useNodeCache: true, 
  useRedis: true, 
  redisConfig: { uri: 'redis://localhost:6379', keyPrefix: 'node:' }
})

// set cache will effect both in local cache and redis
cacheClient.set('key', 'value');

// return promise as default
cacheclient.get('key').then(result => {
  console.log(result)
})
```

## API

### constructor

```javascript
new NodeApiCache({
  useNodeCache,
  nodeCacheTime,
  useRedis,
  redisConfig,
  redisCacheTime
})
```
* @params
* useNodeCache: whether use local node cache;
* nodeCacheTime: the local cache expired time (in millisecond), default is 10 minutes;
* useRedis: whether to use redis to store your cache;
* redisConfig: the redis configuration; redis client is [ioredis](https://github.com/luin/ioredis); the default <b>keyPrefix</b> is "node:";
* redisCacheTime: the redis cache expires time (in second), default is 3 hours

### set 

```javascript
set = function(key, value)
```


### get

```javascript
get = function(key)
```

### clearLocalCache
```javascript
clearLocalCache = function()
```

