import { DateTime, Duration } from "luxon";

export function formatMonthYear(iso: string): string {
  return DateTime.fromISO(iso).toFormat("LLL yyyy");
}

export function formatFullDate(iso: string): string {
  return DateTime.fromISO(iso).toFormat("dd LLL yyyy");
}

export function formatFullDateRsvp(iso: string): string {
  return DateTime.fromISO(iso).toFormat("LLL d, yyyy");
}

export function formatFullDateAndTime(iso: string): string {
  return DateTime.fromISO(iso).toFormat("dd LLL yyyy · HH:mm");
}

/** Media clock for a duration in seconds — 24 → "0:24", 90 → "1:30". */
export function formatDurationClock(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const format = safe >= 3600 ? "hh:mm:ss" : "mm:ss"
  return Duration.fromObject({ seconds: safe }).toFormat(format);
}
