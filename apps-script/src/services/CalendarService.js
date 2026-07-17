/**
 * CalendarService — Google Calendar wrapper.
 *
 * All calendar operations use the default calendar obtained from
 * CalendarApp.getDefaultCalendar(). Methods return plain serialisable objects
 * rather than live Calendar API objects so responses can flow through the
 * router without GAS-object serialisation issues.
 *
 * All mutating methods throw on unrecoverable errors; read-only methods
 * return empty arrays / silent no-ops on expected failures (e.g. event not found).
 */
var CalendarService = {

  /**
   * Get the default Google Calendar for the script owner.
   *
   * @returns {GoogleAppsScript.Calendar.Calendar}
   */
  getDefault: function () {
    var cal = CalendarApp.getDefaultCalendar();
    if (!cal) throw new Error("CalendarService.getDefault: no default calendar found");
    return cal;
  },

  /**
   * Create a calendar event.
   *
   * @param {Object} opts
   * @param {string}   opts.title         — event title (required)
   * @param {string}   opts.startDate     — ISO date/datetime string (required)
   * @param {string}   [opts.endDate]     — ISO datetime string (required for timed events)
   * @param {boolean}  [opts.allDay]      — if true, creates an all-day event
   * @param {string}   [opts.description] — event description
   * @param {string}   [opts.location]    — location string
   * @param {string[]} [opts.guests]      — array of guest email addresses
   * @returns {string} event id
   */
  createEvent: function (opts) {
    if (!opts)           throw new Error("CalendarService.createEvent: opts is required");
    if (!opts.title)     throw new Error("CalendarService.createEvent: opts.title is required");
    if (!opts.startDate) throw new Error("CalendarService.createEvent: opts.startDate is required");

    var calendar    = CalendarService.getDefault();
    var startDate   = new Date(opts.startDate);
    var title       = opts.title;
    var description = opts.description || "";
    var location    = opts.location    || "";
    var guests      = opts.guests      || [];

    var calOpts = {};
    if (description) calOpts.description = description;
    if (location)    calOpts.location    = location;
    if (guests && guests.length > 0) calOpts.guests = guests.join(",");

    var event;
    try {
      if (opts.allDay) {
        if (opts.endDate) {
          var endDate = new Date(opts.endDate);
          event = calendar.createAllDayEvent(title, startDate, endDate, calOpts);
        } else {
          event = calendar.createAllDayEvent(title, startDate, calOpts);
        }
      } else {
        if (!opts.endDate) {
          throw new Error("CalendarService.createEvent: opts.endDate is required for timed events");
        }
        var endDateTime = new Date(opts.endDate);
        event = calendar.createEvent(title, startDate, endDateTime, calOpts);
      }
    } catch (e) {
      AppLogger.error("CalendarService.createEvent: failed", {
        title: title,
        error: String(e.message || e),
      });
      throw e;
    }

    var eventId = event.getId();

    AppLogger.info("CalendarService.createEvent: created", {
      title:   title,
      eventId: eventId,
      allDay:  !!opts.allDay,
      guests:  guests.length,
    });

    return eventId;
  },

  /**
   * List events between two dates.
   *
   * @param {string} startDate — ISO date/datetime string (inclusive)
   * @param {string} endDate   — ISO date/datetime string (inclusive)
   * @returns {Array<{ id: string, title: string, startTime: string, endTime: string, description: string }>}
   */
  listEvents: function (startDate, endDate) {
    if (!startDate) throw new Error("CalendarService.listEvents: startDate is required");
    if (!endDate)   throw new Error("CalendarService.listEvents: endDate is required");

    var calendar = CalendarService.getDefault();
    var events;

    try {
      events = calendar.getEvents(new Date(startDate), new Date(endDate));
    } catch (e) {
      AppLogger.error("CalendarService.listEvents: getEvents failed", {
        startDate: startDate,
        endDate:   endDate,
        error:     String(e.message || e),
      });
      throw e;
    }

    var result = [];
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      result.push({
        id:          ev.getId(),
        title:       ev.getTitle(),
        startTime:   ev.getStartTime().toISOString(),
        endTime:     ev.getEndTime().toISOString(),
        description: ev.getDescription() || "",
      });
    }

    AppLogger.debug("CalendarService.listEvents: listed", {
      startDate: startDate,
      endDate:   endDate,
      count:     result.length,
    });

    return result;
  },

  /**
   * Delete a calendar event by its id. Silent if the event is not found.
   *
   * @param {string} eventId
   */
  deleteEvent: function (eventId) {
    if (!eventId) {
      AppLogger.warn("CalendarService.deleteEvent: eventId is required, skipping");
      return;
    }

    var calendar = CalendarService.getDefault();

    try {
      var event = calendar.getEventById(eventId);
      if (!event) {
        AppLogger.debug("CalendarService.deleteEvent: event not found, nothing to delete", {
          eventId: eventId,
        });
        return;
      }
      event.deleteEvent();
      AppLogger.info("CalendarService.deleteEvent: deleted", { eventId: eventId });
    } catch (e) {
      // Silent on failure — event may have already been deleted or id is stale
      AppLogger.warn("CalendarService.deleteEvent: could not delete event", {
        eventId: eventId,
        error:   String(e.message || e),
      });
    }
  },

  /**
   * Add a guest to an existing calendar event. Silent on failure.
   *
   * @param {string} eventId
   * @param {string} email   — guest email address to add
   */
  addGuest: function (eventId, email) {
    if (!eventId || !email) {
      AppLogger.warn("CalendarService.addGuest: eventId and email are required", {
        eventId: eventId,
        email:   email,
      });
      return;
    }

    try {
      var calendar = CalendarService.getDefault();
      var event    = calendar.getEventById(eventId);

      if (!event) {
        AppLogger.warn("CalendarService.addGuest: event not found", { eventId: eventId });
        return;
      }

      event.addGuest(email);
      AppLogger.info("CalendarService.addGuest: guest added", {
        eventId: eventId,
        email:   email,
      });
    } catch (e) {
      AppLogger.warn("CalendarService.addGuest: failed silently", {
        eventId: eventId,
        email:   email,
        error:   String(e.message || e),
      });
    }
  },
};
