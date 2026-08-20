import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, currency = "PKR"): string {
  return `${currency} ${Math.round(amount).toLocaleString('en-US')}`;
}

export function receiptNo(id: number): string {
  return `RCPT-${new Date().getFullYear()}-${String(id).padStart(5, '0')}`;
}

export function bookingNo(id: number): string {
  return `BKG-${new Date().getFullYear()}-${String(id).padStart(5, '0')}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}
