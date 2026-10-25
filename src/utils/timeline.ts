// Gatherly AI - Timeline & Checklist Engine
// Converts relative integer offsets into deterministic dates using date-fns

import { parseISO, subDays, addDays, format, isValid, isBefore, startOfDay } from 'date-fns';
import { TaskItem, TaskCategory, TaskPriority } from '@/types/event';

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  venue: 'Venue & Logistics',
  catering: 'Catering & Menu',
  decoration: 'Decor & Ambience',
  guests: 'Guest Management',
  logistics: 'Coordination & Transport',
  entertainment: 'Music & Program',
  budget: 'Budget & Contracts',
  general: 'General Prep',
};

export const TASK_PRIORITY_BADGES: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  high: {
    label: 'High Priority',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  low: {
    label: 'Low',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
};

/**
 * Calculates deterministic ISO date string given eventDate (YYYY-MM-DD) and integer daysBeforeEvent
 */
export function calculateTaskDueDate(eventDateStr: string, daysBeforeEvent: number): string {
  try {
    const baseDate = parseISO(eventDateStr);
    if (!isValid(baseDate)) return eventDateStr;

    // daysBeforeEvent > 0 means before event (subDays)
    // daysBeforeEvent < 0 means after event (addDays)
    const targetDate =
      daysBeforeEvent >= 0
        ? subDays(baseDate, daysBeforeEvent)
        : addDays(baseDate, Math.abs(daysBeforeEvent));

    return format(targetDate, 'yyyy-MM-dd');
  } catch {
    return eventDateStr;
  }
}

/**
 * Recomputes task due dates when the overall event date changes,
 * preserving any user tasks that were explicitly marked with `isCustomDate: true`.
 */
export function recalculateAllTaskDates(
  tasks: TaskItem[],
  newEventDateStr: string
): TaskItem[] {
  return tasks.map((task) => {
    if (task.isCustomDate) {
      return task;
    }
    const newDueDate = calculateTaskDueDate(newEventDateStr, task.daysBeforeEvent);
    return {
      ...task,
      dueDate: newDueDate,
    };
  });
}

/**
 * Checks if a task is overdue (dueDate is before today and task is not completed)
 */
export function isTaskOverdue(task: TaskItem, referenceDate: Date = new Date()): boolean {
  if (task.isCompleted) return false;
  try {
    const taskDate = parseISO(task.dueDate);
    if (!isValid(taskDate)) return false;
    const today = startOfDay(referenceDate);
    return isBefore(taskDate, today);
  } catch {
    return false;
  }
}

/**
 * Verifies whether all prerequisite tasks in the dependency chain are completed.
 * Returns { isBlocked: boolean, missingDependencies: TaskItem[] }
 */
export function checkTaskDependencies(
  task: TaskItem,
  allTasks: TaskItem[]
): { isBlocked: boolean; missingDependencies: TaskItem[] } {
  if (!task.dependencies || task.dependencies.length === 0) {
    return { isBlocked: false, missingDependencies: [] };
  }

  const missing: TaskItem[] = [];
  for (const depId of task.dependencies) {
    const found = allTasks.find((t) => t.id === depId);
    if (found && !found.isCompleted) {
      missing.push(found);
    }
  }

  return {
    isBlocked: missing.length > 0,
    missingDependencies: missing,
  };
}

/**
 * Computes progress stats for tasks
 */
export function getTaskProgress(tasks: TaskItem[], referenceDate: Date = new Date()): {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  percentage: number;
  upcomingThisWeek: number;
} {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      percentage: 0,
      upcomingThisWeek: 0,
    };
  }

  let completed = 0;
  let overdue = 0;
  let upcomingThisWeek = 0;
  const today = startOfDay(referenceDate);
  const nextWeek = addDays(today, 7);

  for (const task of tasks) {
    if (task.isCompleted) {
      completed++;
    } else {
      if (isTaskOverdue(task, referenceDate)) {
        overdue++;
      } else {
        try {
          const d = parseISO(task.dueDate);
          if (isValid(d) && !isBefore(d, today) && isBefore(d, nextWeek)) {
            upcomingThisWeek++;
          }
        } catch {
          // ignore invalid date
        }
      }
    }
  }

  const percentage = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    pending: total - completed,
    overdue,
    percentage,
    upcomingThisWeek,
  };
}
