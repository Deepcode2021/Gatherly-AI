import { BudgetSummary, EventPlan, ReadinessScoreBreakdown } from '@/types/event';
import { calculateBudgetSummary } from './budget';
import { calculateEventReadiness } from './readiness';
import { getCountdownLabel, getDaysUntil } from './formatters';

export interface DashboardEventEntry {
  event: EventPlan;
  budgetSummary: BudgetSummary;
  readiness: ReadinessScoreBreakdown;
  countdown: ReturnType<typeof getCountdownLabel>;
}

export interface DashboardMetrics {
  entries: DashboardEventEntry[];
  totalEvents: number;
  totalAllocatedBudget: number;
  totalEffectiveSpend: number;
  totalCompletedTasks: number;
  totalTasksCount: number;
  upcomingDeadlinesCount: number;
  overallTaskPercent: number;
}

export function calculateDashboardMetrics(
  events: EventPlan[],
  referenceDate: Date = new Date()
): DashboardMetrics {
  let totalAllocatedBudget = 0;
  let totalEffectiveSpend = 0;
  let totalCompletedTasks = 0;
  let totalTasksCount = 0;
  let upcomingDeadlinesCount = 0;

  const entries = events.map((event) => {
    const budgetSummary = calculateBudgetSummary(event.totalBudget, event.budgetItems);
    const readiness = calculateEventReadiness(event, referenceDate, budgetSummary);

    totalAllocatedBudget += budgetSummary.totalBudget;
    totalEffectiveSpend += budgetSummary.effectiveTotal;

    for (const task of event.tasks) {
      totalTasksCount++;
      if (task.isCompleted) {
        totalCompletedTasks++;
      } else {
        const daysUntilDue = getDaysUntil(task.dueDate, referenceDate);
        if (daysUntilDue >= 0 && daysUntilDue <= 7) {
          upcomingDeadlinesCount++;
        }
      }
    }

    return {
      event,
      budgetSummary,
      readiness,
      countdown: getCountdownLabel(event.eventDate, referenceDate),
    };
  });

  return {
    entries,
    totalEvents: events.length,
    totalAllocatedBudget,
    totalEffectiveSpend,
    totalCompletedTasks,
    totalTasksCount,
    upcomingDeadlinesCount,
    overallTaskPercent:
      totalTasksCount > 0 ? Math.round((totalCompletedTasks / totalTasksCount) * 100) : 0,
  };
}
