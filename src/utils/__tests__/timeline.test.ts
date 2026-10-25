import { describe, it, expect } from 'vitest';
import {
  calculateTaskDueDate,
  recalculateAllTaskDates,
  isTaskOverdue,
  checkTaskDependencies,
  getTaskProgress,
} from '../timeline';
import { TaskItem } from '@/types/event';
import { subDays, addDays, format } from 'date-fns';

describe('timeline engine', () => {
  it('calculates task due dates from daysBeforeEvent offset', () => {
    // 10 days before 2026-11-20 is 2026-11-10
    expect(calculateTaskDueDate('2026-11-20', 10)).toBe('2026-11-10');
    // 0 days before is event date
    expect(calculateTaskDueDate('2026-11-20', 0)).toBe('2026-11-20');
  });

  it('recalculates task dates when event date shifts, preserving custom dates', () => {
    const tasks: TaskItem[] = [
      {
        id: 't1',
        title: 'Book hall',
        description: 'inspect hall',
        category: 'venue',
        priority: 'high',
        daysBeforeEvent: 15,
        dueDate: '2026-11-05',
        isCompleted: false,
      },
      {
        id: 't2',
        title: 'Custom task',
        description: 'custom',
        category: 'general',
        priority: 'low',
        daysBeforeEvent: 5,
        dueDate: '2026-11-12',
        isCustomDate: true,
        isCompleted: false,
      },
    ];

    const shifted = recalculateAllTaskDates(tasks, '2026-12-20');
    expect(shifted[0].dueDate).toBe('2026-12-05');
    // Custom task retains its date
    expect(shifted[1].dueDate).toBe('2026-11-12');
  });

  it('detects overdue tasks correctly', () => {
    const today = new Date();
    const overdueTask: TaskItem = {
      id: 't1',
      title: 'Overdue task',
      description: '...',
      category: 'catering',
      priority: 'high',
      daysBeforeEvent: 20,
      dueDate: format(subDays(today, 2), 'yyyy-MM-dd'),
      isCompleted: false,
    };
    const completedTask: TaskItem = {
      ...overdueTask,
      isCompleted: true,
    };
    const futureTask: TaskItem = {
      ...overdueTask,
      dueDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    };

    expect(isTaskOverdue(overdueTask, today)).toBe(true);
    expect(isTaskOverdue(completedTask, today)).toBe(false);
    expect(isTaskOverdue(futureTask, today)).toBe(false);
  });

  it('checks task dependencies accurately', () => {
    const allTasks: TaskItem[] = [
      {
        id: 't1',
        title: 'Select Venue',
        description: '',
        category: 'venue',
        priority: 'high',
        daysBeforeEvent: 20,
        dueDate: '2026-11-01',
        isCompleted: false,
      },
      {
        id: 't2',
        title: 'Order Decor',
        description: '',
        category: 'decoration',
        priority: 'medium',
        daysBeforeEvent: 10,
        dueDate: '2026-11-10',
        dependencies: ['t1'],
        isCompleted: false,
      },
    ];

    const check1 = checkTaskDependencies(allTasks[1], allTasks);
    expect(check1.isBlocked).toBe(true);
    expect(check1.missingDependencies[0].id).toBe('t1');

    // Mark t1 complete
    allTasks[0].isCompleted = true;
    const check2 = checkTaskDependencies(allTasks[1], allTasks);
    expect(check2.isBlocked).toBe(false);
    expect(check2.missingDependencies.length).toBe(0);
  });

  it('computes task progress percentages', () => {
    const tasks: TaskItem[] = [
      {
        id: '1',
        title: 'Task 1',
        description: '',
        category: 'general',
        priority: 'low',
        daysBeforeEvent: 1,
        dueDate: '2026-11-10',
        isCompleted: true,
      },
      {
        id: '2',
        title: 'Task 2',
        description: '',
        category: 'general',
        priority: 'low',
        daysBeforeEvent: 1,
        dueDate: '2026-11-10',
        isCompleted: false,
      },
    ];

    const progress = getTaskProgress(tasks);
    expect(progress.total).toBe(2);
    expect(progress.completed).toBe(1);
    expect(progress.percentage).toBe(50);
  });
});
