import { describe, it, expect } from 'vitest';
import {
  formatINR,
  formatIndianNumber,
  formatCompactINR,
  formatDate,
  getCountdownLabel,
} from '../formatters';
import { addDays, subDays } from 'date-fns';

describe('formatters', () => {
  it('formats INR currency correctly', () => {
    expect(formatINR(0)).toMatch(/₹\s?0/);
    expect(formatINR(150000)).toMatch(/₹\s?1,50,000/);
    expect(formatINR(40000)).toMatch(/₹\s?40,000/);
  });

  it('formats Indian numbers with commas', () => {
    expect(formatIndianNumber(10000000)).toBe('1,00,00,000');
    expect(formatIndianNumber(54321)).toBe('54,321');
  });

  it('formats compact INR amounts', () => {
    expect(formatCompactINR(40000)).toBe('₹40K');
    expect(formatCompactINR(150000)).toBe('₹1.5 Lakh');
    expect(formatCompactINR(25000000)).toBe('₹2.5 Cr');
  });

  it('formats dates consistently', () => {
    expect(formatDate('2026-11-15')).toBe('15 Nov 2026');
  });

  it('computes countdown labels accurately', () => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const yesterday = subDays(today, 1);

    expect(getCountdownLabel(today.toISOString().slice(0, 10), today).text).toBe('Today!');
    expect(getCountdownLabel(tomorrow.toISOString().slice(0, 10), today).text).toBe('Tomorrow');
    expect(getCountdownLabel(yesterday.toISOString().slice(0, 10), today).text).toBe('Yesterday');
  });
});
