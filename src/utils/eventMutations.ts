import {
  BudgetItem,
  EventPlan,
  PersonalizedIdea,
  TaskItem,
  VendorItem,
  VendorStatus,
} from '@/types/event';
import { toNonNegativeInteger } from './ids';

export function toggleTaskCompletion(event: EventPlan, taskId: string): EventPlan {
  return {
    ...event,
    tasks: event.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            isCompleted: !task.isCompleted,
            completedAt: task.isCompleted ? undefined : new Date().toISOString(),
          }
        : task
    ),
  };
}

export function addTask(event: EventPlan, task: TaskItem): EventPlan {
  return { ...event, tasks: [task, ...event.tasks] };
}

export function removeTask(event: EventPlan, taskId: string): EventPlan {
  return { ...event, tasks: event.tasks.filter((task) => task.id !== taskId) };
}

export function updateBudgetItemCost(
  event: EventPlan,
  itemId: string,
  field: 'actualCost' | 'estimatedCost' | 'paidAmount',
  value: number
): EventPlan {
  const safeValue = toNonNegativeInteger(value);

  return {
    ...event,
    budgetItems: event.budgetItems.map((item) =>
      item.id === itemId ? { ...item, [field]: safeValue } : item
    ),
  };
}

export function addBudgetItem(event: EventPlan, item: BudgetItem): EventPlan {
  return { ...event, budgetItems: [...event.budgetItems, item] };
}

export function removeBudgetItem(event: EventPlan, itemId: string): EventPlan {
  return {
    ...event,
    budgetItems: event.budgetItems.filter((item) => item.id !== itemId),
  };
}

export function updateVendorStatus(
  event: EventPlan,
  vendorId: string,
  status: VendorStatus
): EventPlan {
  return {
    ...event,
    vendors: event.vendors.map((vendor) =>
      vendor.id === vendorId ? { ...vendor, status } : vendor
    ),
  };
}

export function updateVendorField(
  event: EventPlan,
  vendorId: string,
  field: 'vendorName' | 'contactNotes' | 'quotationNotes',
  value: string
): EventPlan {
  return {
    ...event,
    vendors: event.vendors.map((vendor) =>
      vendor.id === vendorId ? { ...vendor, [field]: value } : vendor
    ),
  };
}

export function addVendor(event: EventPlan, vendor: VendorItem): EventPlan {
  return { ...event, vendors: [...event.vendors, vendor] };
}

export function toggleIdeaFavorite(event: EventPlan, ideaId: string): EventPlan {
  return {
    ...event,
    ideas: event.ideas.map((idea) =>
      idea.id === ideaId ? { ...idea, isFavorite: !idea.isFavorite } : idea
    ),
  };
}

export function replaceIdeas(
  event: EventPlan,
  generatedIdeas: PersonalizedIdea[]
): EventPlan {
  const favorites = event.ideas.filter((idea) => idea.isFavorite);
  return { ...event, ideas: [...favorites, ...generatedIdeas] };
}
