import { describe, it, expect } from 'vitest';
import { calculateBudgetSummary } from '../budget';
import { BudgetItem } from '@/types/event';

describe('calculateBudgetSummary', () => {
  const sampleItems: BudgetItem[] = [
    {
      id: '1',
      category: 'venue',
      description: 'Lawn rental',
      estimatedCost: 15000,
      actualCost: 14000,
      paidAmount: 5000,
    },
    {
      id: '2',
      category: 'catering',
      description: 'Buffet',
      estimatedCost: 20000,
      actualCost: 22000,
      paidAmount: 10000,
    },
    {
      id: '3',
      category: 'decoration',
      description: 'Fairy lights',
      estimatedCost: 5000,
      // actualCost undefined -> falls back to estimatedCost 5000
    },
  ];

  it('calculates deterministic totals and effective costs', () => {
    const summary = calculateBudgetSummary(50000, sampleItems);

    expect(summary.totalBudget).toBe(50000);
    expect(summary.totalEstimated).toBe(40000); // 15k + 20k + 5k
    expect(summary.totalActual).toBe(36000); // 14k + 22k
    expect(summary.effectiveTotal).toBe(41000); // 14k + 22k + 5k
    expect(summary.remainingBudget).toBe(9000); // 50000 - 41000
    expect(summary.isOverBudget).toBe(false);
    expect(summary.overspendingAmount).toBe(0);
    expect(summary.utilizationPercentage).toBe(82); // 41000/50000 = 82%
    expect(summary.totalPaid).toBe(15000);
    expect(summary.remainingToPay).toBe(26000); // 41000 - 15000
  });

  it('detects overspending accurately and calculates overage', () => {
    // Budget is 35,000, spend is 41,000
    const summary = calculateBudgetSummary(35000, sampleItems);

    expect(summary.isOverBudget).toBe(true);
    expect(summary.overspendingAmount).toBe(6000);
    expect(summary.remainingBudget).toBe(-6000);
    expect(summary.utilizationPercentage).toBe(117);
  });

  it('aggregates category breakdowns correctly', () => {
    const summary = calculateBudgetSummary(50000, sampleItems);
    const catering = summary.categoryBreakdown.find((c) => c.category === 'catering');
    const venue = summary.categoryBreakdown.find((c) => c.category === 'venue');

    expect(catering?.actual).toBe(22000);
    expect(venue?.actual).toBe(14000);
  });
});
