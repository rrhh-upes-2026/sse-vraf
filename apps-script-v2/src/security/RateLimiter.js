/**
 * RateLimiter — protección contra ataques de fuerza bruta.
 *
 * Almacena el estado en CacheService (TTL = duración del bloqueo).
 * Por defecto: 5 intentos fallidos → bloqueo de 15 minutos.
 */
var RateLimiter = (function () {
  var NS = "rl:";

  function key_(id) { return NS + id; }

  function getState_(id) {
    var raw = CacheService.getScriptCache().get(key_(id));
    return raw ? JSON.parse(raw) : { count: 0, lockedUntil: 0 };
  }

  function setState_(id, state) {
    var ttl = Math.ceil(Config.lockoutMs() / 1000);
    CacheService.getScriptCache().put(key_(id), JSON.stringify(state), ttl);
  }

  return {
    /** Lanza error si el ID está actualmente bloqueado. */
    check: function (id) {
      var s = getState_(id);
      if (s.lockedUntil && new Date().getTime() < s.lockedUntil) {
        var mins = Math.ceil((s.lockedUntil - new Date().getTime()) / 60000);
        var e = new Error("Cuenta bloqueada temporalmente. Intente en " + mins + " minuto(s).");
        e.code = "RATE_LIMITED";
        throw e;
      }
    },

    /** Registra un intento fallido. Lanza error si se alcanza el límite. */
    record: function (id) {
      var s = getState_(id);
      var max = Config.maxLoginAttempts();
      s.count = (s.count || 0) + 1;

      if (s.count >= max) {
        s.lockedUntil = new Date().getTime() + Config.lockoutMs();
        setState_(id, s);
        var e = new Error("Demasiados intentos fallidos. Cuenta bloqueada por " + Math.ceil(Config.lockoutMs() / 60000) + " minutos.");
        e.code = "RATE_LIMITED";
        throw e;
      }

      setState_(id, s);
      return max - s.count; // intentos restantes
    },

    /** Limpia el contador tras un login exitoso. */
    clear: function (id) {
      CacheService.getScriptCache().remove(key_(id));
    },
  };
})();
