import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateForInput(date: Date | undefined) {
  if (!date) {
    return;
  }
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

export function formatDateRange(start: Date | string, end: Date | string) {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;

  const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    month: "short",
    timeZoneName: "short",
    weekday: "short",
    year: "numeric"
  });
  return dateTimeFormat.formatRange(startDate, endDate);
}

export function generateRandomString(length: number) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
