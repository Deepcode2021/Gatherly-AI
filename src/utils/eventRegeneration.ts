import { EventPlan, PersonalizedIdea, TaskItem } from '@/types/event';
import { AIPlanResponse } from '@/types/schemas';
import { calculateTaskDueDate } from './timeline';

export function buildPersonalizedIdeas(
  generated: AIPlanResponse['ideas'],
  timestamp: number
): PersonalizedIdea[] {
  return generated.map((idea, index) => ({
    id: `regen-i-${timestamp}-${index + 1}`,
    title: idea.title,
    category: idea.category,
    description: idea.description,
    whyItFits: idea.whyItFits,
    costImpact: idea.costImpact,
    effortLevel: idea.effortLevel,
    isFavorite: false,
  }));
}

export function buildTasksForEvent(
  generated: AIPlanResponse['tasks'],
  eventDate: string,
  timestamp: number
): TaskItem[] {
  return generated.map((task, index) => ({
    id: `regen-t-${timestamp}-${index + 1}`,
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    daysBeforeEvent: task.daysBeforeEvent,
    dueDate: calculateTaskDueDate(eventDate, task.daysBeforeEvent),
    isCompleted: false,
    estimatedDuration: task.estimatedDuration || '',
  }));
}

export function replacePendingTasks(
  event: EventPlan,
  generated: AIPlanResponse['tasks'],
  timestamp: number
): EventPlan {
  const retainedTasks = event.tasks.filter(
    (task) => task.isCompleted || task.isCustomDate
  );

  return {
    ...event,
    tasks: [...retainedTasks, ...buildTasksForEvent(generated, event.eventDate, timestamp)],
  };
}
