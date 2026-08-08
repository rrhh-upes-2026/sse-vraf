// ─── CacheService wrapper ─────────────────────────────────────────────────────
// GAS CacheService limit: 100 KB per key, max 6 h TTL.
// We chunk large payloads across sequential keys when > 90 KB.

const CHUNK_LIMIT = 90000; // bytes before chunking

/**
 * Store `value` (serialised JSON) in script cache under `key`.
 * Large payloads are automatically split into numbered chunks.
 */
function cacheSet(key, value, ttl) {
  const cache = CacheService.getScriptCache();
  const json  = JSON.stringify(value);

  if (json.length <= CHUNK_LIMIT) {
    cache.put(key, json, ttl);
    cache.put(key + '__chunks', '1', ttl);
    return;
  }

  const chunks = [];
  for (let i = 0; i < json.length; i += CHUNK_LIMIT) {
    chunks.push(json.slice(i, i + CHUNK_LIMIT));
  }
  chunks.forEach(function(chunk, i) {
    cache.put(key + '__' + i, chunk, ttl);
  });
  cache.put(key + '__chunks', String(chunks.length), ttl);
}

/**
 * Retrieve and parse a previously cached value, or return null on miss.
 */
function cacheGet(key) {
  const cache  = CacheService.getScriptCache();
  const nStr   = cache.get(key + '__chunks');
  if (!nStr) return null;

  const n = parseInt(nStr, 10);
  if (n === 1) {
    const raw = cache.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  const parts = [];
  for (let i = 0; i < n; i++) {
    const chunk = cache.get(key + '__' + i);
    if (!chunk) return null; // partial miss — treat as miss
    parts.push(chunk);
  }
  return JSON.parse(parts.join(''));
}

/**
 * Delete a cached key (all chunks).
 */
function cacheDelete(key) {
  const cache = CacheService.getScriptCache();
  const nStr  = cache.get(key + '__chunks');
  if (!nStr) return;

  const n = parseInt(nStr, 10);
  if (n === 1) {
    cache.remove(key);
  } else {
    for (let i = 0; i < n; i++) cache.remove(key + '__' + i);
  }
  cache.remove(key + '__chunks');
}

/**
 * Return cached value if present; otherwise call `fetchFn()`, cache the
 * result, and return it.
 */
function getCachedOrFetch(key, ttl, fetchFn) {
  const cached = cacheGet(key);
  if (cached !== null) return cached;
  const fresh = fetchFn();
  cacheSet(key, fresh, ttl);
  return fresh;
}
