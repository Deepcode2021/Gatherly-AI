'use client';

import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { BudgetItem, EventPlan, TaskItem, VendorItem, VendorStatus } from '@/types/event';
import {
  saveEvent,
  deleteEvent,
  loadDemoEventIntoStorage,
} from '@/utils/storage';
import { useEvent } from '@/utils/useEvents';
import { calculateBudgetSummary } from '@/utils/budget';
import { calculateEventReadiness } from '@/utils/readiness';
import {
  addBudgetItem,
  addTask,
  addVendor,
  removeBudgetItem,
  removeTask,
  replaceIdeas,
  toggleIdeaFavorite,
  toggleTaskCompletion,
  updateBudgetItemCost,
  updateVendorField,
  updateVendorStatus,
} from '@/utils/eventMutations';
import {
  buildPersonalizedIdeas,
  replacePendingTasks,
} from '@/utils/eventRegeneration';
import { requestEventPlan } from '@/utils/aiPlanClient';
import { EventWorkspaceHeader } from '@/components/event/EventWorkspaceHeader';
import { OverviewTab } from '@/components/event/OverviewTab';
import { BudgetTab } from '@/components/event/BudgetTab';
import { TimelineTab } from '@/components/event/TimelineTab';
import { VendorsTab } from '@/components/event/VendorsTab';
import { IdeasTab } from '@/components/event/IdeasTab';
import { EventTab } from '@/components/event/types';
import confetti from 'canvas-confetti';

const DEMO_EVENT_ID = 'demo-bhopal-30th-birthday';

export default function EventWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const storedEvent = useEvent(eventId);

  if (!storedEvent) {
    if (eventId === DEMO_EVENT_ID) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0EB] text-[#2D5A43] mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#182620]">
            Load Bhopal Demonstration Celebration
          </h2>
          <p className="text-sm text-[#5C6E64] max-w-md mx-auto">
            Ready to explore our 60-guest, ₹40,000 rooftop sunset birthday celebration plan?
          </p>
          <Button
            variant="accent"
            size="md"
            onClick={() => {
              loadDemoEventIntoStorage();
            }}
          >
            Initialize & Open Demo Workspace
          </Button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#182620]">Event Not Found</h2>
        <p className="text-sm text-[#5C6E64]">
          The requested event could not be found in your local storage.
        </p>
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return <EventWorkspace event={storedEvent} />;
}

function EventWorkspace({ event }: { event: EventPlan }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EventTab>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestEvent = useRef(event);

  useEffect(() => {
    latestEvent.current = event;
  }, [event]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3000);
  };

  const budgetSummary = useMemo(
    () => calculateBudgetSummary(event.totalBudget, event.budgetItems),
    [event.totalBudget, event.budgetItems]
  );

  const readiness = useMemo(
    () => calculateEventReadiness(event, new Date(), budgetSummary),
    [event, budgetSummary]
  );

  const persist = (updated: EventPlan) => {
    saveEvent(updated);
  };

  const handleToggleTask = (taskId: string) => {
    const target = event.tasks.find((task) => task.id === taskId);
    if (target && !target.isCompleted) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }
    persist(toggleTaskCompletion(event, taskId));
  };

  const handleDeleteTask = (taskId: string) => {
    persist(removeTask(event, taskId));
    showToast('Task removed');
  };

  const handleCreateTask = (task: TaskItem) => {
    persist(addTask(event, task));
    showToast('Task created');
  };

  const handleUpdateCost = (
    itemId: string,
    field: 'actualCost' | 'estimatedCost' | 'paidAmount',
    value: number
  ) => {
    persist(updateBudgetItemCost(event, itemId, field, value));
  };

  const handleDeleteExpense = (itemId: string) => {
    persist(removeBudgetItem(event, itemId));
    showToast('Expense item removed');
  };

  const handleCreateExpense = (item: BudgetItem) => {
    persist(addBudgetItem(event, item));
    showToast('Expense added');
  };

  const handleUpdateVendorStatus = (vendorId: string, status: VendorStatus) => {
    persist(updateVendorStatus(event, vendorId, status));
    showToast(`Vendor status updated to ${status.replace('_', ' ')}`);
  };

  const handleUpdateVendorField = (
    vendorId: string,
    field: 'vendorName' | 'contactNotes' | 'quotationNotes',
    value: string
  ) => {
    persist(updateVendorField(event, vendorId, field, value));
  };

  const handleCreateVendor = (vendor: VendorItem) => {
    persist(addVendor(event, vendor));
    showToast('Vendor added');
  };

  const handleToggleFavorite = (ideaId: string) => {
    persist(toggleIdeaFavorite(event, ideaId));
  };

  const handleRegenerateSection = async (section: 'ideas' | 'timeline') => {
    setIsRegenerating(true);
    showToast(`Refreshing ${section}...`);

    const current = latestEvent.current;
    const result = await requestEventPlan({
      title: current.title,
      eventType: current.eventType,
      eventDate: current.eventDate,
      city: current.city,
      guestCount: current.guestCount,
      totalBudget: current.totalBudget,
      venueType: current.venueType,
      theme: current.theme,
      dietary: current.dietary,
      accessibility: current.accessibility,
      priorities: current.priorities,
      additionalNotes: current.additionalNotes,
      sectionToRegenerate: section,
    });

    if (result.status === 'success') {
      const timestamp = Date.now();
      const baseEvent = latestEvent.current;
      const updated =
        section === 'ideas'
          ? replaceIdeas(
              baseEvent,
              buildPersonalizedIdeas(result.data.ideas, timestamp)
            )
          : replacePendingTasks(baseEvent, result.data.tasks, timestamp);

      persist(updated);
      showToast(section === 'ideas' ? 'Fresh ideas generated!' : 'Fresh tasks generated!');
    } else if (result.status === 'apiKeyMissing') {
      showToast('Regeneration unavailable in demo mode');
    } else {
      showToast(result.message);
    }

    setIsRegenerating(false);
  };

  const handleDeleteEvent = () => {
    deleteEvent(event.id);
    router.push('/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 right-6 z-50"
      >
        {toastMessage && (
          <div className="px-4 py-2.5 rounded-xl bg-[#182620] text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150">
            <Check className="w-4 h-4 text-[#C85A32]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      <EventWorkspaceHeader
        event={event}
        readiness={readiness}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDeleteRequest={() => setShowDeleteModal(true)}
      />

      {activeTab === 'overview' && (
        <OverviewTab
          event={event}
          budgetSummary={budgetSummary}
          onToggleTask={handleToggleTask}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetTab
          event={event}
          budgetSummary={budgetSummary}
          onUpdateCost={handleUpdateCost}
          onDeleteExpense={handleDeleteExpense}
          onCreateExpense={handleCreateExpense}
        />
      )}

      {activeTab === 'timeline' && (
        <TimelineTab
          event={event}
          isRegenerating={isRegenerating}
          onRegenerate={() => handleRegenerateSection('timeline')}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onCreateTask={handleCreateTask}
        />
      )}

      {activeTab === 'vendors' && (
        <VendorsTab
          event={event}
          onUpdateStatus={handleUpdateVendorStatus}
          onUpdateField={handleUpdateVendorField}
          onCreateVendor={handleCreateVendor}
        />
      )}

      {activeTab === 'ideas' && (
        <IdeasTab
          event={event}
          isRegenerating={isRegenerating}
          onRegenerate={() => handleRegenerateSection('ideas')}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      <Dialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Celebration Plan?"
        description="Are you sure you want to permanently delete this event plan from local storage?"
        confirmLabel="Yes, Delete Plan"
        confirmVariant="danger"
        onConfirm={handleDeleteEvent}
      />
    </div>
  );
}
