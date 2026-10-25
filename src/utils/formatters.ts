// Gatherly AI - Indian Currency and Date Formatting Utilities
import { parseISO, format, differenceInCalendarDays, isValid } from 'date-fns';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrNumberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

/**
 * Format an integer amount into standard Indian currency format (e.g. ₹1,50,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  return inrFormatter.format(Math.round(amount));
}

/**
 * Format an integer number with Indian comma grouping without currency sign (e.g. 1,50,000)
 */
export function formatIndianNumber(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  return inrNumberFormatter.format(Math.round(val));
}

/**
 * Compact Indian currency formatting (e.g. ₹40K, ₹1.5 Lakh, ₹2.4 Cr)
 */
export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    const cr = (abs / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `${sign}₹${cr} Cr`;
  }
  if (abs >= 100000) {
    const lakh = (abs / 100000).toFixed(1).replace(/\.?0+$/, '');
    return `${sign}₹${lakh} Lakh`;
  }
  if (abs >= 1000) {
    const k = (abs / 1000).toFixed(1).replace(/\.?0+$/, '');
    return `${sign}₹${k}K`;
  }
  return `${sign}₹${abs}`;
}

/**
 * Format ISO date string into readable English (e.g. 15 Nov 2026)
 */
export function formatDate(dateStr: string, formatPattern: string = 'dd MMM yyyy'): string {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, formatPattern);
  } catch {
    return dateStr;
  }
}

/**
 * Calculate calendar days difference from today to target date
 */
export function getDaysUntil(dateStr: string, referenceDate: Date = new Date()): number {
  try {
    const target = parseISO(dateStr);
    if (!isValid(target)) return 0;
    return differenceInCalendarDays(target, referenceDate);
  } catch {
    return 0;
  }
}

/**
 * User-friendly relative countdown string
 */
export function getCountdownLabel(dateStr: string, referenceDate: Date = new Date()): {
  text: string;
  isOverdue: boolean;
  days: number;
} {
  const diff = getDaysUntil(dateStr, referenceDate);
  if (diff === 0) {
    return { text: 'Today!', isOverdue: false, days: 0 };
  }
  if (diff === 1) {
    return { text: 'Tomorrow', isOverdue: false, days: 1 };
  }
  if (diff > 1) {
    return { text: `${diff} days away`, isOverdue: false, days: diff };
  }
  if (diff === -1) {
    return { text: 'Yesterday', isOverdue: true, days: -1 };
  }
  return { text: `${Math.abs(diff)} days ago`, isOverdue: true, days: diff };
}
