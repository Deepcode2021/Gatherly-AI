// Gatherly AI - Event Readiness Score Engine
// Transparent, deterministic, multi-factor scoring based on actual application state

import {
  EventPlan,
  ReadinessScoreBreakdown,
} from '@/types/event';
import { calculateBudgetSummary } from './budget';
import { isTaskOverdue } from './timeline';
import { parseISO, isValid, differenceInCalendarDays } from 'date-fns';

/**
 * Calculates a 0-100 Event Readiness Score with transparent breakdown and actionable alerts.
 * Weight distribution:
 * - Checklist completion: 40 points
 * - Vendor readiness: 25 points
 * - Budget health: 20 points
 * - Risk & Contingency preparedness: 15 points
 */
export function calculateEventReadiness(
  event: EventPlan,
  referenceDate: Date = new Date()
): ReadinessScoreBreakdown {
  const alerts: ReadinessScoreBreakdown['criticalAlerts'] = [];
  const details: ReadinessScoreBreakdown['details'] = [];

  // 1. Checklist Completion (Max 40 points)
  const totalTasks = event.tasks.length;
  let completedTasks = 0;
  let overdueTasks = 0;
  let highPriorityDueSoon = 0;

  for (const t of event.tasks) {
    if (t.isCompleted) {
      completedTasks++;
    } else {
      if (isTaskOverdue(t, referenceDate)) {
        overdueTasks++;
      } else {
        try {
          const taskDate = parseISO(t.dueDate);
          if (isValid(taskDate)) {
            const diff = differenceInCalendarDays(taskDate, referenceDate);
            if (diff >= 0 && diff <= 3 && t.priority === 'high') {
              highPriorityDueSoon++;
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }

  const taskRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const rawTaskScore = Math.round(taskRatio * 40);
  // Penalty of 3 points per overdue task (up to max 12)
  const taskPenalty = Math.min(12, overdueTasks * 3);
  const taskScore = Math.max(0, rawTaskScore - taskPenalty);

  details.push({
    label: 'Checklist Execution',
    score: taskScore,
    maxScore: 40,
    explanation: `${completedTasks} of ${totalTasks} tasks completed (${Math.round(taskRatio * 100)}%). ${
      overdueTasks > 0 ? `${overdueTasks} overdue task(s) deducted ${taskPenalty} pts.` : 'No overdue tasks.'
    }`,
  });

  if (overdueTasks > 0) {
    alerts.push({
      id: 'alert-overdue-tasks',
      type: 'danger',
      title: `${overdueTasks} Overdue Task${overdueTasks > 1 ? 's' : ''}`,
      message: 'Pending deadlines require immediate attention to keep preparation on track.',
      actionTab: 'timeline',
    });
  }

  if (highPriorityDueSoon > 0) {
    alerts.push({
      id: 'alert-high-priority-due',
      type: 'warning',
      title: `${highPriorityDueSoon} High-Priority Task${highPriorityDueSoon > 1 ? 's' : ''} Due in 3 Days`,
      message: 'Review your upcoming milestones to ensure vendors and team are aligned.',
      actionTab: 'timeline',
    });
  }

  // 2. Vendor Readiness (Max 25 points)
  const totalVendors = event.vendors.length;
  let bookedVendors = 0;
  let shortlistedVendors = 0;
  let essentialUnbooked = 0;

  for (const v of event.vendors) {
    if (v.status === 'booked') {
      bookedVendors++;
    } else if (v.status === 'shortlisted' || v.status === 'contacted') {
      shortlistedVendors++;
    } else {
      if (['venue', 'catering', 'photography'].includes(v.category)) {
        essentialUnbooked++;
      }
    }
  }

  let vendorScore = 0;
  if (totalVendors > 0) {
    const bookedPoints = (bookedVendors / totalVendors) * 18;
    const shortlistedPoints = (shortlistedVendors / totalVendors) * 7;
    vendorScore = Math.min(25, Math.round(bookedPoints + shortlistedPoints));
  } else {
    vendorScore = 15; // neutral if no vendors required
  }

  details.push({
    label: 'Vendor Contracts & Bookings',
    score: vendorScore,
    maxScore: 25,
    explanation: `${bookedVendors} booked, ${shortlistedVendors} in pipeline out of ${totalVendors} required services.`,
  });

  if (essentialUnbooked > 0) {
    alerts.push({
      id: 'alert-essential-vendors',
      type: 'warning',
      title: `${essentialUnbooked} Key Vendor${essentialUnbooked > 1 ? 's' : ''} Not Yet Contacted`,
      message: 'Critical vendors (Venue/Catering/Photo) should be shortlisted early to secure event dates.',
      actionTab: 'vendors',
    });
  }

  // 3. Budget Health (Max 20 points)
  const budgetSummary = calculateBudgetSummary(event.totalBudget, event.budgetItems);
  let budgetScore = 20;

  if (budgetSummary.isOverBudget) {
    const overPercent =
      event.totalBudget > 0
        ? (budgetSummary.overspendingAmount / event.totalBudget) * 100
        : 50;
    if (overPercent > 25) {
      budgetScore = 4;
    } else if (overPercent > 10) {
      budgetScore = 10;
    } else {
      budgetScore = 14;
    }

    alerts.push({
      id: 'alert-budget-exceeded',
      type: 'danger',
      title: 'Budget Allocation Exceeded',
      message: `Total estimated spend exceeds target budget by ₹${budgetSummary.overspendingAmount.toLocaleString('en-IN')}. Review suggested savings.`,
      actionTab: 'budget',
    });
  } else if (budgetSummary.utilizationPercentage === 0) {
    budgetScore = 8; // no budget items allocated yet
  } else if (budgetSummary.utilizationPercentage > 90) {
    budgetScore = 17; // tight budget
  } else {
    budgetScore = 20; // healthy budget
  }

  details.push({
    label: 'Budget Discipline',
    score: budgetScore,
    maxScore: 20,
    explanation: budgetSummary.isOverBudget
      ? `Over budget by ₹${budgetSummary.overspendingAmount.toLocaleString('en-IN')} (${budgetSummary.utilizationPercentage}% utilized).`
      : `Healthy financial plan (${budgetSummary.utilizationPercentage}% allocated, ₹${budgetSummary.remainingBudget.toLocaleString('en-IN')} buffer).`,
  });

  // 4. Risk Mitigation & Environmental Readiness (Max 15 points)
  let riskScore = 15;
  const hasRisksDocumented = event.risks && event.risks.length > 0;
  if (!hasRisksDocumented) {
    riskScore -= 5;
  }

  // Check outdoor contingency
  if (event.venueType === 'outdoor' || event.venueType === 'mixed') {
    const hasWeatherContingency =
      event.risks.some((r) =>
        r.risk.toLowerCase().includes('weather') ||
        r.risk.toLowerCase().includes('rain') ||
        r.mitigation.toLowerCase().includes('canopy') ||
        r.mitigation.toLowerCase().includes('indoor')
      ) ||
      event.ideas.some((i) =>
        i.title.toLowerCase().includes('rain') ||
        i.title.toLowerCase().includes('weather') ||
        i.title.toLowerCase().includes('tent')
      );

    if (!hasWeatherContingency) {
      riskScore -= 4;
      alerts.push({
        id: 'alert-outdoor-weather',
        type: 'warning',
        title: 'Outdoor Venue Weather Backup Advised',
        message: 'Your event is outdoor/mixed. We suggest adding a rain/wind contingency plan and shelter rental.',
        actionTab: 'ideas',
      });
    }
  }

  details.push({
    label: 'Risk & Contingency Preparedness',
    score: Math.max(0, riskScore),
    maxScore: 15,
    explanation: `${event.risks.length} risk mitigations identified and analyzed for this celebration format.`,
  });

  const overallScore = Math.min(
    100,
    Math.max(0, taskScore + vendorScore + budgetScore + Math.max(0, riskScore))
  );

  return {
    overallScore,
    taskScore,
    vendorScore,
    budgetScore,
    riskScore: Math.max(0, riskScore),
    completedTasks,
    totalTasks,
    bookedVendors,
    totalVendors,
    budgetUtilizedPercentage: budgetSummary.utilizationPercentage,
    details,
    criticalAlerts: alerts,
  };
}
