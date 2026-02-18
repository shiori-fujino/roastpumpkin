// src/lib/roster/time.ts

export type ShiftStatus = "now" | "today";

export function parseHHMMSSParts(hhmmss: string): { hh: number; mm: number; ss: number } {
  const [hhStr, mmStr, ssStr] = (hhmmss || "0:0:0").split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  const ss = Number(ssStr ?? "0");
  return {
    hh: Number.isFinite(hh) ? hh : 0,
    mm: Number.isFinite(mm) ? mm : 0,
    ss: Number.isFinite(ss) ? ss : 0,
  };
}

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function makeDateOnDay(day: Date, hhmmss: string) {
  const { hh, mm, ss } = parseHHMMSSParts(hhmmss);
  const x = new Date(day);
  x.setHours(hh, mm, ss, 0);
  return x;
}

export function formatTimeLabel(hhmmss: string) {
  const [hhStr, mmStr] = (hhmmss || "0:0:0").split(":");
  let hh = Number(hhStr);
  const mm = Number(mmStr);
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(mm).padStart(2, "0")} ${ampm}`;
}

export function formatWorkingTime(start: string, end: string) {
  return `${formatTimeLabel(start)} - ${formatTimeLabel(end)}`;
}

/**
 * Date-anchored shift status:
 * - rosterDay is the SHOP DAY anchor (today tab => shopToday, tomorrow tab => shopToday+1)
 * - if end <= start => end is next day (overnight)
 * - end "00:00:00" means 24:00 of that day, not start-of-day
 */
export function getShiftStatusOnDay(
  startHHMMSS: string,
  endHHMMSS: string,
  rosterDay: Date,
  now: Date = new Date()
): ShiftStatus {
  const day0 = startOfDay(rosterDay);
  const startAt = makeDateOnDay(day0, startHHMMSS);

  const endParts = parseHHMMSSParts(endHHMMSS);
  const isMidnight = endParts.hh === 0 && endParts.mm === 0 && endParts.ss === 0;

  let endAt = makeDateOnDay(day0, endHHMMSS);

  // interpret end=00:00 as 24:00 if start isn't also midnight
  if (
    isMidnight &&
    (startAt.getHours() !== 0 || startAt.getMinutes() !== 0 || startAt.getSeconds() !== 0)
  ) {
    endAt = addDays(day0, 1); // 24:00
  }

  // overnight
  if (endAt.getTime() <= startAt.getTime()) {
    endAt = addDays(endAt, 1);
  }

  if (now.getTime() >= startAt.getTime() && now.getTime() < endAt.getTime()) return "now";
  if (now.getTime() >= startAt.getTime() && now.getTime() < endAt.getTime()) return "now";
return "today";

}
