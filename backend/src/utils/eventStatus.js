const EVENT_STATUSES = ["Upcoming", "Ongoing", "Completed"];

function parseCalendarDate(value) {
  if (!value) {
    return null;
  }

  const dateValue = String(value).trim().split("T")[0];
  const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function startOfDay(value) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate()
  );
}

export function getEventStatus(date, referenceDate = new Date()) {
  const eventDate = parseCalendarDate(date);

  if (!eventDate) {
    return "Upcoming";
  }

  const today = startOfDay(referenceDate);

  if (eventDate < today) {
    return "Completed";
  }

  if (eventDate.getTime() === today.getTime()) {
    return "Ongoing";
  }

  return "Upcoming";
}

export function withDerivedEventStatus(event) {
  const serialized =
    event && typeof event.toObject === "function"
      ? event.toObject()
      : { ...event };

  return {
    ...serialized,
    status: getEventStatus(serialized.date),
  };
}

export function withDerivedEventStatuses(events) {
  return events.map(withDerivedEventStatus);
}

export { EVENT_STATUSES };
