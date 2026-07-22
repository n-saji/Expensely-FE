import { format, formatDistanceToNow, differenceInHours } from "date-fns";

export function parseNotificationDate(timeInput: string | number | Date): Date {
  if (!timeInput) return new Date();
  if (timeInput instanceof Date) return timeInput;
  if (typeof timeInput === "number") return new Date(timeInput);

  const str = String(timeInput).trim();
  const d = new Date(str);

  if (!isNaN(d.getTime())) {
    const now = new Date();
    // Avoid future distance glitches due to minor clock drift
    if (d.getTime() > now.getTime()) {
      return now;
    }
    return d;
  }

  return new Date();
}

export function formatNotificationTime(timeInput: string | number | Date) {
  const date = parseNotificationDate(timeInput);
  const hours = differenceInHours(new Date(), date);

  if (hours < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return format(date, "dd MMM, yyyy");
}
