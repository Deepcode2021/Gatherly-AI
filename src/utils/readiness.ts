import {
  BudgetSummary,
  EventPlan,
  ReadinessScoreBreakdown,
} from '@/types/event';
import { calculateBudgetSummary } from './budget';
import { isTaskOverdue } from './timeline';
import { parseISO, isValid, differenceInCalendarDays } from 'date-fns';

export function calculateEventReadiness(
  event: EventPlan,
  referenceDate: Date = new Date(),
  budgetSummary?: BudgetSummary
): ReadinessScoreBreakdown {
  const alerts: ReadinessScoreBreakdown['criticalAlerts'] = [];
  const details: ReadinessScoreBreakdown['details'] = [];

  const totalTasks = event.tasks.length;
  let completedTasks = 0;
  let overdueTasks = 0;
  let highPriorityDueSoon = 0;

  for (const task of event.tasks) {
    if (task.isCompleted) {
      completedTasks++;
      continue;
    }

    if (isTaskOverdue(task, referenceDate)) {
      overdueTasks++;
      continue;
    }

    try {
      const taskDate = parseISO(task.dueDate);
      if (isValid(taskDate)) {
        const diff = differenceInCalendarDays(taskDate, referenceDate);
        if (diff >= 0 && diff <= 3 && task.priority === 'high') {
          highPriorityDueSoon++;
        }
      }
    } catch {
      continue;
    }
  }

  const taskRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const taskPenalty = Math.min(12, overdueTasks * 3);
  const taskScore = Math.max(0, Math.round(taskRatio * 40) - taskPenalty);

  details.push({
    label: 'Checklist Execution',
    score: taskScore,
    maxScore: 40,
    explanation: `${completedTasks} of ${totalTasks} tasks completed (${Math.round(taskRatio * 100)}%). ${
      overdueTasks > 0
        ? `${overdueTasks} overdue task(s) deducted ${taskPenalty} pts.`
        : 'No overdue tasks.'
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

  const totalVendors = event.vendors.length;
  let bookedVendors = 0;
  let shortlistedVendors = 0;
  let essentialUnbooked = 0;

  for (const vendor of event.vendors) {
    if (vendor.status === 'booked') {
      bookedVendors++;
    } else if (vendor.status === 'shortlisted' || vendor.status === 'contacted') {
      shortlistedVendors++;
    } else if (['venue', 'catering', 'photography'].includes(vendor.category)) {
      essentialUnbooked++;
    }
  }

  let vendorScore = 15;
  if (totalVendors > 0) {
    const bookedPoints = (bookedVendors / totalVendors) * 18;
    const shortlistedPoints = (shortlistedVendors / totalVendors) * 7;
    vendorScore = Math.min(25, Math.round(bookedPoints + shortlistedPoints));
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

  const budget = budgetSummary ?? calculateBudgetSummary(event.totalBudget, event.budgetItems);
  let budgetScore = 20;

  if (budget.isOverBudget) {
    const overPercent =
      event.totalBudget > 0 ? (budget.overspendingAmount / event.totalBudget) * 100 : 50;
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
      message: `Total estimated spend exceeds target budget by ₹${budget.overspendingAmount.toLocaleString('en-IN')}. Review suggested savings.`,
      actionTab: 'budget',
    });
  } else if (budget.utilizationPercentage === 0) {
    budgetScore = 8;
  } else if (budget.utilizationPercentage > 90) {
    budgetScore = 17;
  }

  details.push({
    label: 'Budget Discipline',
    score: budgetScore,
    maxScore: 20,
    explanation: budget.isOverBudget
      ? `Over budget by ₹${budget.overspendingAmount.toLocaleString('en-IN')} (${budget.utilizationPercentage}% utilized).`
      : `Healthy financial plan (${budget.utilizationPercentage}% allocated, ₹${budget.remainingBudget.toLocaleString('en-IN')} buffer).`,
  });

  let riskScore = 15;
  if (!event.risks || event.risks.length === 0) {
    riskScore -= 5;
  }

  if (event.venueType === 'outdoor' || event.venueType === 'mixed') {
    const hasWeatherContingency =
      event.risks.some(
        (risk) =>
          risk.risk.toLowerCase().includes('weather') ||
          risk.risk.toLowerCase().includes('rain') ||
          risk.mitigation.toLowerCase().includes('canopy') ||
          risk.mitigation.toLowerCase().includes('indoor')
      ) ||
      event.ideas.some(
        (idea) =>
          idea.title.toLowerCase().includes('rain') ||
          idea.title.toLowerCase().includes('weather') ||
          idea.title.toLowerCase().includes('tent')
      );

    if (!hasWeatherContingency) {
      riskScore -= 4;
      alerts.push({
        id: 'alert-outdoor-weather',
        type: 'warning',
        title: 'Outdoor Venue Weather Backup Advised',
        message:
          'Your event is outdoor/mixed. We suggest adding a rain/wind contingency plan and shelter rental.',
        actionTab: 'ideas',
      });
    }
  }

  const safeRiskScore = Math.max(0, riskScore);
  details.push({
    label: 'Risk & Contingency Preparedness',
    score: safeRiskScore,
    maxScore: 15,
    explanation: `${event.risks.length} risk mitigations identified and analyzed for this celebration format.`,
  });

  return {
    overallScore: Math.min(
      100,
      Math.max(0, taskScore + vendorScore + budgetScore + safeRiskScore)
    ),
    taskScore,
    vendorScore,
    budgetScore,
    riskScore: safeRiskScore,
    completedTasks,
    totalTasks,
    bookedVendors,
    totalVendors,
    budgetUtilizedPercentage: budget.utilizationPercentage,
    details,
    criticalAlerts: alerts,
  };
}
