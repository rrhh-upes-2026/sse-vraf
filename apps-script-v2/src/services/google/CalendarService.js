/**
 * CalendarService — gestión de eventos en Google Calendar.
 */
var CalendarService = {
  createEvent: function (params) {
    Validator.requireFields(params, ["title", "start"]);
    var cal   = CalendarApp.getDefaultCalendar();
    var start = new Date(params.start);
    var end   = params.end ? new Date(params.end) : new Date(start.getTime() + 60 * 60 * 1000);

    var options = { description: params.description || "" };
    if (params.location)  options.location = params.location;
    if (params.attendees && params.attendees.length) options.guests = params.attendees.join(",");

    var event = cal.createEvent(params.title, start, end, options);
    return { id: event.getId(), url: event.getEditEventUrl(), title: event.getTitle() };
  },

  getEvents: function (from, to, calendarId) {
    var cal    = calendarId ? CalendarApp.getCalendarById(calendarId) : CalendarApp.getDefaultCalendar();
    var events = cal.getEvents(new Date(from), new Date(to));
    return events.map(function (e) {
      return {
        id:          e.getId(),
        title:       e.getTitle(),
        start:       e.getStartTime().toISOString(),
        end:         e.getEndTime().toISOString(),
        description: e.getDescription(),
        location:    e.getLocation(),
      };
    });
  },

  deleteEvent: function (eventId) {
    var cal   = CalendarApp.getDefaultCalendar();
    var event = cal.getEventById(eventId);
    if (event) event.deleteEvent();
    return { deleted: !!event };
  },
};
