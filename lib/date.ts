import type { OrgEvent } from "./types";

const parseCalendarDate = (iso: string): Date => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const isUpcoming = (e: OrgEvent, now: Date = new Date()): boolean => {
  if (e.archived) return false;
  const end = parseCalendarDate(e.endDate ?? e.startDate);
  end.setHours(23, 59, 59, 999);
  return end >= now;
};

export const isPast = (e: OrgEvent, now: Date = new Date()): boolean =>
  !isUpcoming(e, now);

const monthShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export const formatRange = (start: string, end?: string): string => {
  const s = parseCalendarDate(start);
  if (!end) {
    return `${monthShort[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()}`;
  }
  const e = parseCalendarDate(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${monthShort[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  }
  if (sameYear) {
    return `${monthShort[s.getMonth()]} ${s.getDate()} – ${monthShort[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${monthShort[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()} – ${monthShort[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
};

export const formatMonthYear = (iso: string): string => {
  const d = parseCalendarDate(iso);
  return `${monthShort[d.getMonth()]} ${d.getFullYear()}`;
};

const monthLong = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const formatPostDate = (iso: string): string => {
  const d = parseCalendarDate(iso);
  return `${monthLong[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
