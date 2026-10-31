import { describe, it, expect } from 'vitest';
import { EventPlan, TaskItem } from '@/types/event';
import { AIPlanResponse, CreateEventFormData } from '@/types/schemas';
import { getDemoEvent } from '../demoEvent';
import {
  toggleTaskCompletion,
  updateBudgetItemCost,
  replaceIdeas,
} from '../eventMutations';
import { replacePendingTasks } from '../eventRegeneration';
import { createEventPlanFromAI } from '../eventMapper';
import { calculateDashboardMetrics } from '../dashboardMetrics';
import {
  checkTaskDependencies,
  checkTaskDependenciesInIndex,
  createTaskIndex,
} from '../timeline';

const referenceDate = new Date('2026-10-31T09:00:00');

function buildTask(overrides: Partial<TaskItem> & { id: string }): TaskItem {
  return {
    title: `Task ${overrides.id}`,
    description: '',
    category: 'general',
    priority: 'medium',
    daysBeforeEvent: 10,
    dueDate: '2026-11-10',
    isCompleted: false,
    ...overrides,
  };
}

function buildEvent(overrides: Partial<EventPlan> = {}): EventPlan {
  return {
    ...getDemoEvent(referenceDate),
    eventDate: '2026-11-20',
    budgetItems: [],
    tasks: [],
    vendors: [],
    ideas: [],
    risks: [],
    ...overrides,
  };
}

describe('event mutations', () => {
  it('toggles completion without mutating the original event', () => {
    const task = buildTask({ id: 't1' });
    const event = buildEvent({ tasks: [task] });

    const completed = toggleTaskCompletion(event, 't1');
    expect(completed.tasks[0].isCompleted).toBe(true);
    expect(completed.tasks[0].completedAt).toBeTruthy();
    expect(event.tasks[0].isCompleted).toBe(false);

    const restored = toggleTaskCompletion(completed, 't1');
    expect(restored.tasks[0].isCompleted).toBe(false);
    expect(restored.tasks[0].completedAt).toBeUndefined();
  });

  it('normalises edited costs to non-negative integers', () => {
    const event = buildEvent({
      budgetItems: [
        {
          id: 'b1',
          category: 'venue',
          description: 'Hall',
          estimatedCost: 10000,
        },
      ],
    });

    expect(updateBudgetItemCost(event, 'b1', 'actualCost', -250.6).budgetItems[0].actualCost).toBe(0);
    expect(updateBudgetItemCost(event, 'b1', 'actualCost', 12999.6).budgetItems[0].actualCost).toBe(13000);
    expect(event.budgetItems[0].actualCost).toBeUndefined();
  });

  it('keeps favourite ideas when replacing generated ideas', () => {
    const event = buildEvent({
      ideas: [
        {
          id: 'i1',
          title: 'Keep me',
          category: 'decor',
          description: '',
          whyItFits: '',
          costImpact: 'low',
          effortLevel: 'easy',
          isFavorite: true,
        },
        {
          id: 'i2',
          title: 'Replace me',
          category: 'food',
          description: '',
          whyItFits: '',
          costImpact: 'low',
          effortLevel: 'easy',
          isFavorite: false,
        },
      ],
    });

    const replaced = replaceIdeas(event, [
      {
        id: 'i3',
        title: 'Fresh idea',
        category: 'activity',
        description: '',
        whyItFits: '',
        costImpact: 'free',
        effortLevel: 'easy',
        isFavorite: false,
      },
    ]);

    expect(replaced.ideas.map((idea) => idea.id)).toEqual(['i1', 'i3']);
    expect(event.ideas).toHaveLength(2);
  });

  it('preserves completed and custom tasks when regenerating pending tasks', () => {
    const event = buildEvent({
      tasks: [
        buildTask({ id: 'completed', isCompleted: true }),
        buildTask({ id: 'custom', isCustomDate: true }),
        buildTask({ id: 'pending' }),
      ],
    });

    const regenerated = replacePendingTasks(
      event,
      [
        {
          title: 'Generated task',
          description: 'Fresh plan',
          category: 'venue',
          priority: 'high',
          daysBeforeEvent: 5,
          estimatedDuration: '1 hour',
        },
      ],
      123
    );

    expect(regenerated.tasks.map((task) => task.id)).toEqual([
      'completed',
      'custom',
      'regen-t-123-1',
    ]);
    expect(regenerated.tasks[2].dueDate).toBe('2026-11-15');
    expect(regenerated.tasks[2].isCompleted).toBe(false);
  });
});

describe('event mapping', () => {
  const form: CreateEventFormData = {
    title: 'Rooftop Birthday',
    eventType: 'birthday',
    eventDate: '2026-12-10',
    city: 'Bhopal',
    guestCount: 40,
    totalBudget: 30000,
    venueType: 'mixed',
    theme: '',
    dietary: '',
    accessibility: '',
    priorities: ['Great food'],
    additionalNotes: '',
  };

  const generated: AIPlanResponse = {
    concept: {
      themeName: 'Golden Hour',
      conceptDescription: 'Warm lights and marigold decor',
      suggestedColorPalette: ['#C85A32', '#E6AF2E'],
      personalizedRationale: 'Fits a compact rooftop gathering',
    },
    summary: {
      approach: 'Prioritise live food counters',
      keyPriorities: ['Food', 'Lighting'],
      majorConsiderations: 'Weather backup needed',
    },
    budgetItems: [
      {
        category: 'venue',
        description: 'Terrace rental',
        estimatedCost: 8000,
        basis: '',
        assumptions: '',
      },
      {
        category: 'catering',
        description: 'Live counters',
        estimatedCost: 15000,
        basis: '',
        assumptions: '',
      },
      {
        category: 'decoration',
        description: 'Fairy lights',
        estimatedCost: 4000,
        basis: '',
        assumptions: '',
      },
    ],
    tasks: [
      {
        title: 'Book venue',
        description: 'Confirm the terrace booking',
        category: 'venue',
        priority: 'high',
        daysBeforeEvent: 20,
        estimatedDuration: '2 hours',
      },
      {
        title: 'Finalise menu',
        description: 'Pick the live counters',
        category: 'catering',
        priority: 'high',
        daysBeforeEvent: 12,
        estimatedDuration: '1 hour',
      },
      {
        title: 'Order lights',
        description: 'Buy warm fairy lights',
        category: 'decoration',
        priority: 'medium',
        daysBeforeEvent: 7,
        estimatedDuration: '',
      },
      {
        title: 'Confirm guests',
        description: 'Collect final RSVPs',
        category: 'guests',
        priority: 'low',
        daysBeforeEvent: 2,
        estimatedDuration: '',
      },
    ],
    vendors: [
      {
        category: 'venue',
        service: 'Terrace partner',
        bookingDeadlineDays: 21,
        targetBudget: 8000,
        questionsToAsk: ['Is outside catering allowed?'],
      },
      {
        category: 'catering',
        service: 'Chaat counter',
        bookingDeadlineDays: 14,
        targetBudget: 15000,
        questionsToAsk: ['Are Jain options available?'],
      },
    ],
    ideas: [
      {
        title: 'Memory wall',
        category: 'guest_experience',
        description: 'Hang photos on jute twine',
        whyItFits: 'Cheap and personal',
        costImpact: 'low',
        effortLevel: 'easy',
      },
      {
        title: 'Live quiz',
        category: 'activity',
        description: 'Run a quick trivia round',
        whyItFits: 'Free ice breaker',
        costImpact: 'free',
        effortLevel: 'easy',
      },
    ],
    risks: [
      {
        risk: 'Evening showers',
        severity: 'medium',
        mitigation: 'Keep a canopy on standby',
        alternative: 'Move the setup indoors',
      },
    ],
  };

  it('derives an event plan with calculated due dates and one favourite idea', () => {
    const plan = createEventPlanFromAI(form, generated);

    expect(plan.title).toBe(form.title);
    expect(plan.theme).toBe('Golden Hour');
    expect(plan.dietary).toBe('Mixed');
    expect(plan.budgetItems).toHaveLength(3);
    expect(plan.tasks[0].dueDate).toBe('2026-11-20');
    expect(plan.tasks[3].dueDate).toBe('2026-12-08');
    expect(plan.vendors[0].status).toBe('not_contacted');
    expect(plan.vendors[1].bookingDeadline).toBe('2026-11-26');
    expect(plan.ideas[0].isFavorite).toBe(true);
    expect(plan.ideas[1].isFavorite).toBe(false);
    expect(new Set(plan.tasks.map((task) => task.id)).size).toBe(plan.tasks.length);
  });
});

describe('dashboard metrics', () => {
  it('aggregates budget, tasks and deadlines using a single reference date', () => {
    const event = buildEvent({
      tasks: [
        buildTask({ id: 'done', isCompleted: true, dueDate: '2026-10-01' }),
        buildTask({ id: 'today', dueDate: '2026-10-31' }),
        buildTask({ id: 'soon', dueDate: '2026-11-07' }),
        buildTask({ id: 'later', dueDate: '2026-11-08' }),
        buildTask({ id: 'overdue', dueDate: '2026-10-30' }),
      ],
    });

    const metrics = calculateDashboardMetrics([event], referenceDate);

    expect(metrics.totalEvents).toBe(1);
    expect(metrics.entries[0].countdown.days).toBe(20);
    expect(metrics.totalTasksCount).toBe(5);
    expect(metrics.totalCompletedTasks).toBe(1);
    expect(metrics.overallTaskPercent).toBe(20);
    expect(metrics.upcomingDeadlinesCount).toBe(2);
    expect(metrics.totalAllocatedBudget).toBe(event.totalBudget);
    expect(metrics.entries[0].budgetSummary.remainingBudget).toBe(event.totalBudget);
  });

  it('returns zeroed aggregates for an empty event list', () => {
    const metrics = calculateDashboardMetrics([], referenceDate);

    expect(metrics.totalEvents).toBe(0);
    expect(metrics.entries).toEqual([]);
    expect(metrics.overallTaskPercent).toBe(0);
    expect(metrics.upcomingDeadlinesCount).toBe(0);
  });
});

describe('task dependency index', () => {
  it('matches the array implementation and ignores unknown dependencies', () => {
    const blocked = buildTask({ id: 'blocked', dependencies: ['missing', 'open'] });
    const open = buildTask({ id: 'open' });
    const tasks = [blocked, open];
    const index = createTaskIndex(tasks);

    const fromIndex = checkTaskDependenciesInIndex(blocked, index);
    expect(fromIndex).toEqual(checkTaskDependencies(blocked, tasks));
    expect(fromIndex.isBlocked).toBe(true);
    expect(fromIndex.missingDependencies.map((task) => task.id)).toEqual(['open']);

    const unblocked = checkTaskDependenciesInIndex(
      { ...blocked, dependencies: ['missing'] },
      index
    );
    expect(unblocked.isBlocked).toBe(false);
    expect(unblocked.missingDependencies).toEqual([]);
  });

  it('returns quickly for tasks without dependencies', () => {
    const task = buildTask({ id: 'plain' });

    expect(checkTaskDependenciesInIndex(task, createTaskIndex([task]))).toEqual({
      isBlocked: false,
      missingDependencies: [],
    });
  });
});
