'use strict';

const _ = require('lodash');
const buildId = require('../lib/build-settings').buildId;
const bufferFrom = require('buffer-from');

module.exports = function setup (app, router) {
  app.use(caching);
  app.use(denyCacheOnNon2xx);
};

function * denyCacheOnNon2xx (next) {
  yield next;
  if (this.status < 200 || this.status >= 300) {
    this.set('cache-control', 'no-cache, no-store, must-revalidate');
    this.set('pragma', 'no-cache');
    this.set('expires', 0);
  }
}

// USAGE:
//  use this line of code in your route/mw:
//   if (this.cached(myKey, 10)) return; // cache for up to 10 min
//  the 'return' will prevent a render from happening, and this.body|status|
//  default value of `key` is `this.url`
//  default value of `timeInMinutes` is `1440` (24 hours)
const CACHE = {};
const DEFAULT_CACHE_TIME = 60 * 4;
const LONG_CACHE_TIME = 60 * 24 * 30 * 3;
const CACHE_MS = t => (t === 0 ? LONG_CACHE_TIME : t || DEFAULT_CACHE_TIME) * 60 * 1000;
const CACHE_KEY = (k, c) => [k || c.url, buildId, c.hostname, c.state.whitelabel].join('::');
const CACHE_INFO = (k, t, n, c) => ({expires: n + CACHE_MS(t), key: CACHE_KEY(k, c)});
function * caching (next) {
  // const ctx = this;
  const now = Date.now();
  let cacheInfo;

  this.cached = function (key, timeInMinutes) {
    cacheInfo = CACHE_INFO(key, timeInMinutes, now, this);
    if (CACHE[cacheInfo.key]) {
      const item = CACHE[cacheInfo.key];
      if (item.expires < now) {
        delete CACHE[cacheInfo.key];
        return false;
      }
      _.extend(this, item.values);
      for (let h in item.headers) {
        this.set(h, item.headers[h]);
      }
      this._isCachedFlag_ = true;
      return true;
    }
    return false;
  };

  yield next;

  if (!cacheInfo) return;
  if (this._isCachedFlag_) return;
  if (!this.body) return;
  if (this.status < 200 || this.status >= 300) return;

  const _cached = CACHE[cacheInfo.key] = {
    key: cacheInfo.key,
    expires: cacheInfo.expires,
    values: _.pick(this, 'body', 'status', 'type'),
    headers: {
      'Cache-Control': 'public, max-age=' + ((cacheInfo.expires - now) / 1000),
      'Expires': new Date(cacheInfo.expires).toUTCString()
    }
  };

  for (let h in CACHE[cacheInfo.key].headers) {
    this.set(h, CACHE[cacheInfo.key].headers[h]);
  }

  // always cache a buffer for performance
  if (typeof _cached.values.body === 'string') {
    _cached.values.body = bufferFrom(_cached.values.body);
  } else if (_.isPlainObject(_cached.values.body) && _cached.values.type.indexOf('/json') > -1) {
    _cached.values.body = bufferFrom(JSON.stringify(_cached.values.body));
  }

  Object.keys(CACHE).forEach(function (c) {
    if (CACHE[c].expires < now) delete CACHE[c];
  });
}
