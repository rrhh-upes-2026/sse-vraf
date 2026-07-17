/**
 * AppCacheService — wrapper around Apps Script CacheService.
 *
 * All cached values are JSON-serialized strings. Keys are namespaced with
 * a prefix to avoid collisions with other projects sharing the same cache
 * bucket (Apps Script CacheService is script-scoped by default, but we
 * namespace anyway for clarity and future-proofing).
 *
 * TTL ceiling: CacheService maximum is 21 600 s (6 hours); we cap at that.
 *
 * Reference: https://developers.google.com/apps-script/reference/cache/cache-service
 */

var AppCacheService = (function () {
  var NAMESPACE = "sse:";
  var DEFAULT_TTL = 300; // 5 minutes
  var MAX_TTL     = 21600;

  function cache_() {
    return CacheService.getScriptCache();
  }

  function key_(k) {
    return NAMESPACE + String(k);
  }

  return {
    /**
     * Retrieve a cached value and JSON-parse it.
     * Returns null if the key is missing or the value cannot be parsed.
     *
     * @param {string} key
     * @returns {*|null}
     */
    get: function (key) {
      var raw = cache_().get(key_(key));
      if (raw === null || raw === undefined) return null;
      try {
        return JSON.parse(raw);
      } catch (_) {
        return null;
      }
    },

    /**
     * Store a value in the cache as a JSON string.
     *
     * @param {string} key
     * @param {*}      value
     * @param {number} [ttlSeconds]  — defaults to DEFAULT_TTL, capped at MAX_TTL
     */
    set: function (key, value, ttlSeconds) {
      var ttl = Math.min(Math.max(parseInt(ttlSeconds, 10) || DEFAULT_TTL, 1), MAX_TTL);
      try {
        cache_().put(key_(key), JSON.stringify(value), ttl);
      } catch (e) {
        AppLogger.warn("AppCacheService.set failed", { key: key, error: String(e.message || e) });
      }
    },

    /**
     * Remove a key from the cache.
     *
     * @param {string} key
     */
    remove: function (key) {
      cache_().remove(key_(key));
    },

    /**
     * Remove multiple keys from the cache.
     *
     * @param {string[]} keys
     */
    removeAll: function (keys) {
      var prefixed = keys.map(function (k) { return key_(k); });
      cache_().removeAll(prefixed);
    },

    /**
     * Cache-aside: return cached value if present; otherwise call loader(),
     * store the result, and return it.
     *
     * @param {string}   key
     * @param {Function} loader       — zero-argument function that returns the value
     * @param {number}   [ttlSeconds]
     * @returns {*}
     */
    getOrLoad: function (key, loader, ttlSeconds) {
      var cached = AppCacheService.get(key);
      if (cached !== null) return cached;

      var value = loader();
      if (value !== null && value !== undefined) {
        AppCacheService.set(key, value, ttlSeconds);
      }
      return value;
    },
  };
})();
