import { BudgetItem, BudgetSummary, VendorCategory } from '@/types/event';

export const CATEGORY_LABELS: Record<VendorCategory, string> = {
  venue: 'Venue & Hall',
  catering: 'Food & Beverages',
  decoration: 'Decor & Floral',
  photography: 'Photo & Video',
  entertainment: 'Music & Entertainment',
  transport: 'Transport & Logistics',
  rentals: 'Equipment & Rentals',
  other: 'Gifts & Miscellaneous',
};

export function calculateBudgetSummary(
  targetBudget: number,
  items: BudgetItem[]
): BudgetSummary {
  const safeTarget = Math.max(0, Math.round(targetBudget || 0));

  let totalEstimated = 0;
  let totalActual = 0;
  let effectiveTotal = 0;
  let contingencyAllocated = 0;
  let totalPaid = 0;

  const categoryTotals = new Map<
    VendorCategory,
    { allocated: number; actual: number; count: number }
  >();

  for (const item of items) {
    const estimated = Math.max(0, Math.round(item.estimatedCost || 0));
    const actual =
      item.actualCost !== undefined && item.actualCost !== null
        ? Math.max(0, Math.round(item.actualCost))
        : null;
    const paid = Math.max(0, Math.round(item.paidAmount || 0));

    totalEstimated += estimated;
    totalPaid += paid;

    const effectiveCost = actual !== null ? actual : estimated;
    effectiveTotal += effectiveCost;

    if (actual !== null) {
      totalActual += actual;
    }

    if (item.description.toLowerCase().includes('contingency')) {
      contingencyAllocated += effectiveCost;
    }

    const categoryTotal = categoryTotals.get(item.category) ?? {
      allocated: 0,
      actual: 0,
      count: 0,
    };
    categoryTotals.set(item.category, {
      allocated: categoryTotal.allocated + estimated,
      actual: categoryTotal.actual + effectiveCost,
      count: categoryTotal.count + 1,
    });
  }

  const remainingBudget = safeTarget - effectiveTotal;
  const isOverBudget = effectiveTotal > safeTarget;
  const overspendingAmount = isOverBudget ? effectiveTotal - safeTarget : 0;
  const utilizationPercentage =
    safeTarget > 0 ? Math.min(999, Math.round((effectiveTotal / safeTarget) * 100)) : 0;
  const remainingToPay = Math.max(0, effectiveTotal - totalPaid);

  const categoryBreakdown = Array.from(categoryTotals.entries())
    .map(([category, data]) => ({
      category,
      label: CATEGORY_LABELS[category],
      allocated: data.allocated,
      actual: data.actual,
      percentage:
        effectiveTotal > 0 ? Math.round((data.actual / effectiveTotal) * 100) : 0,
      itemCount: data.count,
    }))
    .sort((a, b) => b.actual - a.actual);

  const savingsOpportunities: BudgetSummary['savingsOpportunities'] = [];

  if (isOverBudget) {
    const cateringEntry = categoryBreakdown.find((entry) => entry.category === 'catering');
    if (cateringEntry && cateringEntry.actual > safeTarget * 0.4) {
      savingsOpportunities.push({
        category: 'Food & Beverages',
        suggestion:
          'Catering represents over 40% of spend. Switching to a curated fixed buffet menu can save 10-15%.',
        potentialSavings: Math.round(cateringEntry.actual * 0.12),
      });
    }

    const decorEntry = categoryBreakdown.find((entry) => entry.category === 'decoration');
    if (decorEntry && decorEntry.actual > safeTarget * 0.2) {
      savingsOpportunities.push({
        category: 'Decor',
        suggestion:
          'Utilize seasonal marigold/jasmine floral themes and reusable ambient fairy lights to lower rental costs.',
        potentialSavings: Math.round(decorEntry.actual * 0.2),
      });
    }

    if (contingencyAllocated === 0 && safeTarget > 0) {
      savingsOpportunities.push({
        category: 'Contingency',
        suggestion:
          'Allocate at least 8-10% of total budget to an emergency contingency fund for unexpected guest surges.',
        potentialSavings: 0,
      });
    }
  }

  return {
    totalBudget: safeTarget,
    totalEstimated,
    totalActual,
    effectiveTotal,
    remainingBudget,
    utilizationPercentage,
    isOverBudget,
    overspendingAmount,
    contingencyAllocated,
    totalPaid,
    remainingToPay,
    categoryBreakdown,
    savingsOpportunities,
  };
}
