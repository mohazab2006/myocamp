import type { OrgEvent } from "./types";

export const isUpcoming = (e: OrgEvent, now: Date = new Date()): boolean => {
  if (e.archived) return false;
  const end = new Date(e.endDate ?? e.startDate);
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
  const s = new Date(start);
  if (!end) {
    return `${monthShort[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()}`;
  }
  const e = new Date(end);
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
  const d = new Date(iso);
  return `${monthShort[d.getMonth()]} ${d.getFullYear()}`;
};
