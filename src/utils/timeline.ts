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

export type TaskIndex = ReadonlyMap<string, TaskItem>;

export interface TaskDependencyCheck {
  isBlocked: boolean;
  missingDependencies: TaskItem[];
}

export function createTaskIndex(tasks: TaskItem[]): TaskIndex {
  return new Map(tasks.map((task) => [task.id, task]));
}

export function calculateTaskDueDate(eventDateStr: string, daysBeforeEvent: number): string {
  try {
    const baseDate = parseISO(eventDateStr);
    if (!isValid(baseDate)) return eventDateStr;

    const targetDate =
      daysBeforeEvent >= 0
        ? subDays(baseDate, daysBeforeEvent)
        : addDays(baseDate, Math.abs(daysBeforeEvent));

    return format(targetDate, 'yyyy-MM-dd');
  } catch {
    return eventDateStr;
  }
}

export function recalculateAllTaskDates(
  tasks: TaskItem[],
  newEventDateStr: string
): TaskItem[] {
  return tasks.map((task) => {
    if (task.isCustomDate) return task;

    return {
      ...task,
      dueDate: calculateTaskDueDate(newEventDateStr, task.daysBeforeEvent),
    };
  });
}

export function isTaskOverdue(task: TaskItem, referenceDate: Date = new Date()): boolean {
  if (task.isCompleted) return false;

  try {
    const taskDate = parseISO(task.dueDate);
    if (!isValid(taskDate)) return false;
    return isBefore(taskDate, startOfDay(referenceDate));
  } catch {
    return false;
  }
}

export function checkTaskDependenciesInIndex(
  task: TaskItem,
  taskIndex: TaskIndex
): TaskDependencyCheck {
  if (!task.dependencies || task.dependencies.length === 0) {
    return { isBlocked: false, missingDependencies: [] };
  }

  const missingDependencies: TaskItem[] = [];
  for (const dependencyId of task.dependencies) {
    const dependency = taskIndex.get(dependencyId);
    if (dependency && !dependency.isCompleted) {
      missingDependencies.push(dependency);
    }
  }

  return {
    isBlocked: missingDependencies.length > 0,
    missingDependencies,
  };
}

export function checkTaskDependencies(
  task: TaskItem,
  allTasks: TaskItem[]
): TaskDependencyCheck {
  return checkTaskDependenciesInIndex(task, createTaskIndex(allTasks));
}

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
      continue;
    }

    if (isTaskOverdue(task, referenceDate)) {
      overdue++;
      continue;
    }

    try {
      const dueDate = parseISO(task.dueDate);
      if (isValid(dueDate) && !isBefore(dueDate, today) && isBefore(dueDate, nextWeek)) {
        upcomingThisWeek++;
      }
    } catch {
      continue;
    }
  }

  return {
    total,
    completed,
    pending: total - completed,
    overdue,
    percentage: Math.round((completed / total) * 100),
    upcomingThisWeek,
  };
}
