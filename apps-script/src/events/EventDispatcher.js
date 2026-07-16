/**
 * Synchronous internal event dispatcher. Events fire and are handled within
 * the same request cycle — there are no persistent queues. The permanent
 * record of what happened lives in HistorialAudit (written by AuditService).
 *
 * Usage:
 *   EventDispatcher.on(EVENT_TYPES.PROCESO_CREADO, function(payload) {
 *     // e.g. trigger indicator recalculation
 *   });
 *
 *   EventDispatcher.emit(EVENT_TYPES.PROCESO_CREADO, { id: proc.id, unidadId: ... });
 *
 * Handler errors are swallowed and logged — they do not fail the originating action.
 * Register handlers from the router or Code.js after all modules are loaded.
 */
var EventDispatcher = (function () {
  var handlers = {};

  return {
    /**
     * Register a handler for an event type. Multiple handlers per type are allowed.
     * @param {string} eventType  — one of EVENT_TYPES.*
     * @param {Function} handler  — called with (payload: Object)
     */
    on: function (eventType, handler) {
      if (typeof handler !== "function") {
        throw new Error("EventDispatcher.on: handler must be a function");
      }
      if (!handlers[eventType]) handlers[eventType] = [];
      handlers[eventType].push(handler);
    },

    /**
     * Unregister a specific handler reference.
     * @param {string} eventType
     * @param {Function} handler
     */
    off: function (eventType, handler) {
      if (!handlers[eventType]) return;
      handlers[eventType] = handlers[eventType].filter(function (h) {
        return h !== handler;
      });
    },

    /**
     * Fire all handlers registered for eventType, synchronously in registration order.
     * Handler errors are logged and swallowed.
     * @param {string} eventType
     * @param {Object} payload
     */
    emit: function (eventType, payload) {
      var list = handlers[eventType] || [];
      for (var i = 0; i < list.length; i++) {
        try {
          list[i](payload);
        } catch (err) {
          AppLogger.error("EventDispatcher handler threw", {
            eventType: eventType,
            error: String((err && err.message) || err),
          });
        }
      }
    },

    /**
     * Remove all registered handlers. Useful for test isolation.
     */
    reset: function () {
      handlers = {};
    },
  };
})();
