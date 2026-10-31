import { EventPlan } from '@/types/event';
import { AIPlanResponse, CreateEventFormData } from '@/types/schemas';
import { calculateTaskDueDate } from './timeline';

export function createEventPlanFromAI(
  form: CreateEventFormData,
  generated: AIPlanResponse
): EventPlan {
  const timestamp = Date.now();

  return {
    id: `evt_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
    title: form.title,
    eventType: form.eventType,
    eventDate: form.eventDate,
    city: form.city,
    guestCount: form.guestCount,
    totalBudget: form.totalBudget,
    venueType: form.venueType,
    theme: form.theme || generated.concept.themeName,
    dietary: form.dietary || 'Mixed',
    accessibility: form.accessibility || 'Standard',
    priorities: form.priorities,
    additionalNotes: form.additionalNotes || '',
    createdAt: new Date(timestamp).toISOString(),
    updatedAt: new Date(timestamp).toISOString(),
    isDemo: false,
    concept: generated.concept,
    summary: generated.summary,
    budgetItems: generated.budgetItems.map((item, index) => ({
      id: `b-${timestamp}-${index + 1}`,
      category: item.category,
      description: item.description,
      estimatedCost: item.estimatedCost,
      basis: item.basis || '',
      assumptions: item.assumptions || '',
    })),
    tasks: generated.tasks.map((task, index) => ({
      id: `t-${timestamp}-${index + 1}`,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      daysBeforeEvent: task.daysBeforeEvent,
      dueDate: calculateTaskDueDate(form.eventDate, task.daysBeforeEvent),
      isCompleted: false,
      estimatedDuration: task.estimatedDuration || '',
    })),
    vendors: generated.vendors.map((vendor, index) => ({
      id: `v-${timestamp}-${index + 1}`,
      category: vendor.category,
      service: vendor.service,
      bookingDeadlineDays: vendor.bookingDeadlineDays,
      bookingDeadline: calculateTaskDueDate(form.eventDate, vendor.bookingDeadlineDays),
      targetBudget: vendor.targetBudget,
      status: 'not_contacted',
      questionsToAsk: vendor.questionsToAsk,
    })),
    ideas: generated.ideas.map((idea, index) => ({
      id: `i-${timestamp}-${index + 1}`,
      title: idea.title,
      category: idea.category,
      description: idea.description,
      whyItFits: idea.whyItFits,
      costImpact: idea.costImpact,
      effortLevel: idea.effortLevel,
      isFavorite: index === 0,
    })),
    risks: generated.risks.map((risk, index) => ({
      id: `r-${timestamp}-${index + 1}`,
      risk: risk.risk,
      severity: risk.severity,
      mitigation: risk.mitigation,
      alternative: risk.alternative,
    })),
  };
}
