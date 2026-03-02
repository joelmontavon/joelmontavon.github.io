import {
  format,
  parseISO,
  differenceInDays,
  addDays,
  startOfYear,
  endOfYear,
  isWithinInterval,
  isAfter,
  isBefore,
  isValid,
} from "date-fns";

/**
 * Parse a date string or return the date if already a Date object
 */
export function parseDate(date) {
  if (date instanceof Date) return date;
  if (typeof date === "string") return parseISO(date);
  return null;
}

/**
 * Format a date for display
 */
export function formatDate(date, formatStr = "MMMM d, yyyy") {
  const parsed = parseDate(date);
  if (!parsed || !isValid(parsed)) return "";
  return format(parsed, formatStr);
}

/**
 * Calculate the number of days between two dates (inclusive)
 */
export function daysBetween(start, end) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate) return 0;
  return differenceInDays(endDate, startDate) + 1;
}

/**
 * Calculate coverage days within a measurement period
 */
export function calculateCoverageDays(fillDate, daysSupply, measurementStart, measurementEnd) {
  const start = parseDate(measurementStart);
  const end = parseDate(measurementEnd);
  const fill = parseDate(fillDate);

  if (!start || !end || !fill) return 0;

  const supplyEndDate = addDays(fill, daysSupply - 1);

  // If fill date is after measurement period, no coverage
  if (isAfter(fill, end)) return 0;

  // If supply ends before measurement period, no coverage
  if (isBefore(supplyEndDate, start)) return 0;

  // Calculate overlap
  const effectiveStart = isBefore(fill, start) ? start : fill;
  const effectiveEnd = isAfter(supplyEndDate, end) ? end : supplyEndDate;

  return daysBetween(effectiveStart, effectiveEnd);
}

/**
 * Check if a date is within a measurement period
 */
export function isInMeasurementPeriod(date, start, end) {
  const d = parseDate(date);
  const s = parseDate(start);
  const e = parseDate(end);

  if (!d || !s || !e) return false;

  return isWithinInterval(d, { start: s, end: e });
}

/**
 * Get the measurement year dates
 */
export function getMeasurementYear(year) {
  return {
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 0, 1)),
  };
}

/**
 * Count days in measurement period
 */
export function daysInMeasurementPeriod(start, end) {
  return daysBetween(start, end);
}

export {
  format,
  parseISO,
  differenceInDays,
  addDays,
  isWithinInterval,
  isAfter,
  isBefore,
  isValid,
  startOfYear,
  endOfYear,
};
