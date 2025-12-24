import { format, formatDistanceToNow, differenceInHours } from "date-fns";

export function formatNotificationTime(date: Date) {
  const hours = differenceInHours(new Date(), date);

  if (hours < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return format(date, "dd MMM yyyy, hh:mm a");
}
