import { DateTime } from "luxon";

export function formatMonthYear(iso: string): string {
  return DateTime.fromISO(iso).toFormat("LLL yyyy");
}

export function formatFullDate(iso: string): string {
  return DateTime.fromISO(iso).toFormat("dd LLL yyyy");
}
