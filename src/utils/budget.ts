// Gatherly AI - Deterministic Budget Engine
// Enforces pure integer INR arithmetic without floating-point drift

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

export const CATEGORY_COLORS: Record<VendorCategory, { bg: string; text: string; fill: string }> = {
  venue: { bg: 'bg-emerald-100', text: 'text-emerald-900', fill: '#2D6A4F' },
  catering: { bg: 'bg-amber-100', text: 'text-amber-900', fill: '#D97706' },
  decoration: { bg: 'bg-rose-100', text: 'text-rose-900', fill: '#E11D48' },
  photography: { bg: 'bg-indigo-100', text: 'text-indigo-900', fill: '#4F46E5' },
  entertainment: { bg: 'bg-purple-100', text: 'text-purple-900', fill: '#9333EA' },
  transport: { bg: 'bg-sky-100', text: 'text-sky-900', fill: '#0284C7' },
  rentals: { bg: 'bg-stone-200', text: 'text-stone-900', fill: '#78716C' },
  other: { bg: 'bg-orange-100', text: 'text-orange-900', fill: '#EA580C' },
};

/**
 * Calculates a complete deterministic budget summary from event budget items and target budget.
 */
export function calculateBudgetSummary(
  targetBudget: number,
  items: BudgetItem[]
): BudgetSummary {
  // Safe integer parsing
  const safeTarget = Math.max(0, Math.round(targetBudget || 0));

  let totalEstimated = 0;
  let totalActual = 0;
  let effectiveTotal = 0;
  let contingencyAllocated = 0;
  let totalPaid = 0;

  const categoryMap = new Map<
    VendorCategory,
    { allocated: number; actual: number; count: number }
  >();

  // Initialize all categories
  (Object.keys(CATEGORY_LABELS) as VendorCategory[]).forEach((cat) => {
    categoryMap.set(cat, { allocated: 0, actual: 0, count: 0 });
  });

  for (const item of items) {
    const est = Math.max(0, Math.round(item.estimatedCost || 0));
    const act =
      item.actualCost !== undefined && item.actualCost !== null
        ? Math.max(0, Math.round(item.actualCost))
        : null;
    const paid = Math.max(0, Math.round(item.paidAmount || 0));

    totalEstimated += est;
    totalPaid += paid;

    // Effective cost: if user specified actual cost, use it; otherwise fallback to estimate
    const effectiveCost = act !== null ? act : est;
    effectiveTotal += effectiveCost;

    if (act !== null) {
      totalActual += act;
    }

    if (
      item.description.toLowerCase().includes('contingency') ||
      item.category === 'other'
    ) {
      if (item.description.toLowerCase().includes('contingency')) {
        contingencyAllocated += effectiveCost;
      }
    }

    const currentCat = categoryMap.get(item.category) || {
      allocated: 0,
      actual: 0,
      count: 0,
    };
    categoryMap.set(item.category, {
      allocated: currentCat.allocated + est,
      actual: currentCat.actual + effectiveCost,
      count: currentCat.count + 1,
    });
  }

  const remainingBudget = safeTarget - effectiveTotal;
  const isOverBudget = effectiveTotal > safeTarget;
  const overspendingAmount = isOverBudget ? effectiveTotal - safeTarget : 0;
  const utilizationPercentage =
    safeTarget > 0 ? Math.min(999, Math.round((effectiveTotal / safeTarget) * 100)) : 0;
  const remainingToPay = Math.max(0, effectiveTotal - totalPaid);

  // Category breakdown
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([cat, data]) => {
      const percentage =
        effectiveTotal > 0
          ? Math.round((data.actual / effectiveTotal) * 100)
          : 0;
      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        allocated: data.allocated,
        actual: data.actual,
        percentage,
        itemCount: data.count,
      };
    })
    .filter((cat) => cat.itemCount > 0 || cat.actual > 0)
    .sort((a, b) => b.actual - a.actual);

  // Savings opportunities
  const savingsOpportunities: {
    category: string;
    suggestion: string;
    potentialSavings: number;
  }[] = [];

  if (isOverBudget) {
    const cateringEntry = categoryBreakdown.find((c) => c.category === 'catering');
    if (cateringEntry && cateringEntry.actual > safeTarget * 0.4) {
      savingsOpportunities.push({
        category: 'Food & Beverages',
        suggestion:
          'Catering represents over 40% of spend. Switching to a curated fixed buffet menu can save 10-15%.',
        potentialSavings: Math.round(cateringEntry.actual * 0.12),
      });
    }

    const decorEntry = categoryBreakdown.find((c) => c.category === 'decoration');
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
