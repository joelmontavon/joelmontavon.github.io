import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatNumber(num, options = {}) {
  return new Intl.NumberFormat("en-US", options).format(num);
}

export function formatPercent(num, decimals = 1) {
  return `${(num * 100).toFixed(decimals)}%`;
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function truncate(text, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}
