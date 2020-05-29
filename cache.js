const cache = require('memory-cache');

module.exports.put = (key, value, deleteTime = 10 * 60 * 1000) => cache.put(key, value, deleteTime);

module.exports = cache;
