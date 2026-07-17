/**
 * LockService — thin wrappers around Apps Script LockService.
 *
 * Prevents concurrent writes to the same resource. The GAS lock service
 * blocks until the lock is acquired or the timeout expires. All mutating
 * workspace-admin controller actions that write to the same entity should
 * use withScriptLock to avoid sheet race conditions.
 *
 * Reference: https://developers.google.com/apps-script/reference/lock/lock-service
 */

var AppLockService = {
  /**
   * Acquire a script-wide lock, run fn(), then release.
   * The script lock is shared across all executions — use it for operations
   * that must not run concurrently for ANY user (e.g. ID generation, setup).
   *
   * @param {Function} fn        — zero-argument function to run while locked
   * @param {number}   timeoutMs — max wait in ms before throwing (default 10 000)
   * @returns {*} return value of fn
   */
  withScriptLock: function (fn, timeoutMs) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(timeoutMs || 10000);
      return fn();
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Acquire a user-scoped lock, run fn(), then release.
   * The user lock is isolated per Google Account — safe for per-user operations
   * like updating a user's own profile or drafts.
   *
   * @param {Function} fn        — zero-argument function to run while locked
   * @param {number}   timeoutMs — max wait in ms before throwing (default 5 000)
   * @returns {*} return value of fn
   */
  withUserLock: function (fn, timeoutMs) {
    var lock = LockService.getUserLock();
    try {
      lock.waitLock(timeoutMs || 5000);
      return fn();
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Try to acquire a script lock without blocking.
   * Returns true if the lock was acquired; false otherwise.
   * Caller is responsible for releasing via the returned lock object.
   *
   * @returns {{ acquired: boolean, lock: Lock }}
   */
  tryScriptLock: function () {
    var lock = LockService.getScriptLock();
    var acquired = lock.tryLock(0);
    return { acquired: acquired, lock: lock };
  },
};
