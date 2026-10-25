'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Wallet,
  CheckCircle2,
  Circle,
  Users,
  Lightbulb,
  Printer,
  Download,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Plus,
  RefreshCw,
  Check,
  Star,
  FileText,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Dialog } from '@/components/ui/Dialog';
import {
  EventPlan,
  BudgetItem,
  TaskItem,
  VendorItem,
  TaskPriority,
  TaskCategory,
  VendorStatus,
} from '@/types/event';
import {
  saveEvent,
  deleteEvent,
  downloadEventJSONFile,
  loadDemoEventIntoStorage,
} from '@/utils/storage';
import { useEvent } from '@/utils/useEvents';
import { calculateBudgetSummary, CATEGORY_LABELS } from '@/utils/budget';
import {
  getTaskProgress,
  isTaskOverdue,
  checkTaskDependencies,
  TASK_PRIORITY_BADGES,
  TASK_CATEGORY_LABELS,
} from '@/utils/timeline';
import { calculateEventReadiness } from '@/utils/readiness';
import {
  formatINR,
  formatDate,
  getCountdownLabel,
} from '@/utils/formatters';
import confetti from 'canvas-confetti';

type TabType = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas';

export default function EventWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  // Reactively retrieve the event from storage via custom store
  const storedEvent = useEvent(eventId);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showReadinessBreakdown, setShowReadinessBreakdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state for tasks
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');

  // Modal states for adding custom items
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  // Form states for new expense
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'other' as BudgetItem['category'],
    estimatedCost: 1000,
    actualCost: undefined as number | undefined,
    basis: '',
  });

  // Form states for new task
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'general' as TaskCategory,
    priority: 'medium' as TaskPriority,
    daysBeforeEvent: 7,
    dueDate: '',
  });

  // Form states for new vendor
  const [newVendor, setNewVendor] = useState({
    service: '',
    category: 'other' as BudgetItem['category'],
    targetBudget: 5000,
    bookingDeadlineDays: 10,
    vendorName: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // If this is the demo celebration route and it's not yet in storage, provide an easy 1-click initialize
  if (!storedEvent) {
    if (eventId === 'demo-bhopal-30th-birthday') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0EB] text-[#2D5A43] mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#182620]">Load Bhopal Demonstration Celebration</h2>
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

  const event = storedEvent;

  // Derive dynamic state deterministically
  const budgetSummary = calculateBudgetSummary(event.totalBudget, event.budgetItems);
  const taskProgress = getTaskProgress(event.tasks);
  const readiness = calculateEventReadiness(event);
  const countdown = getCountdownLabel(event.eventDate);

  // Persistence Helper
  const persistEventChanges = (updated: EventPlan) => {
    saveEvent(updated);
  };

  // --- TASK ACTIONS ---
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = event.tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.isCompleted;
        if (nextState) {
          // Trigger confetti celebration
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
        }
        return {
          ...t,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    persistEventChanges({
      ...event,
      tasks: updatedTasks,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = event.tasks.filter((t) => t.id !== taskId);
    persistEventChanges({
      ...event,
      tasks: updatedTasks,
    });
    showToast('Task removed');
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const taskDate =
      newTask.dueDate ||
      new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const taskItem: TaskItem = {
      id: `custom-t-${Date.now()}`,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      category: newTask.category,
      priority: newTask.priority,
      daysBeforeEvent: newTask.daysBeforeEvent,
      dueDate: taskDate,
      isCustomDate: true,
      isCompleted: false,
    };

    persistEventChanges({
      ...event,
      tasks: [taskItem, ...event.tasks],
    });

    setShowAddTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      daysBeforeEvent: 7,
      dueDate: '',
    });
    showToast('Task created');
  };

  // --- BUDGET ACTIONS ---
  const handleUpdateCost = (
    itemId: string,
    field: 'actualCost' | 'estimatedCost' | 'paidAmount',
    value: number
  ) => {
    const safeVal = isNaN(value) ? 0 : Math.max(0, Math.round(value));
    const updatedItems = event.budgetItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          [field]: safeVal,
        };
      }
      return item;
    });

    persistEventChanges({
      ...event,
      budgetItems: updatedItems,
    });
  };

  const handleDeleteExpense = (itemId: string) => {
    const updatedItems = event.budgetItems.filter((i) => i.id !== itemId);
    persistEventChanges({
      ...event,
      budgetItems: updatedItems,
    });
    showToast('Expense item removed');
  };

  const handleCreateExpense = () => {
    if (!newExpense.description.trim()) return;

    const expenseItem: BudgetItem = {
      id: `custom-b-${Date.now()}`,
      description: newExpense.description.trim(),
      category: newExpense.category,
      estimatedCost: Math.max(0, Math.round(newExpense.estimatedCost || 0)),
      actualCost:
        newExpense.actualCost !== undefined
          ? Math.max(0, Math.round(newExpense.actualCost))
          : undefined,
      basis: newExpense.basis.trim(),
      paidAmount: 0,
    };

    persistEventChanges({
      ...event,
      budgetItems: [...event.budgetItems, expenseItem],
    });

    setShowAddExpenseModal(false);
    setNewExpense({
      description: '',
      category: 'other',
      estimatedCost: 1000,
      actualCost: undefined,
      basis: '',
    });
    showToast('Expense added');
  };

  // --- VENDOR ACTIONS ---
  const handleUpdateVendorStatus = (vendorId: string, status: VendorStatus) => {
    const updatedVendors = event.vendors.map((v) => {
      if (v.id === vendorId) {
        return { ...v, status };
      }
      return v;
    });

    persistEventChanges({
      ...event,
      vendors: updatedVendors,
    });
    showToast(`Vendor status updated to ${status.replace('_', ' ')}`);
  };

  const handleUpdateVendorNotes = (
    vendorId: string,
    field: 'vendorName' | 'contactNotes' | 'quotationNotes',
    val: string
  ) => {
    const updatedVendors = event.vendors.map((v) => {
      if (v.id === vendorId) {
        return { ...v, [field]: val };
      }
      return v;
    });

    persistEventChanges({
      ...event,
      vendors: updatedVendors,
    });
  };

  const handleCreateVendor = () => {
    if (!newVendor.service.trim()) return;

    const deadline = new Date(Date.now() + newVendor.bookingDeadlineDays * 86400000)
      .toISOString()
      .slice(0, 10);

    const vendorItem: VendorItem = {
      id: `custom-v-${Date.now()}`,
      service: newVendor.service.trim(),
      category: newVendor.category,
      targetBudget: Math.max(0, Math.round(newVendor.targetBudget || 0)),
      bookingDeadlineDays: newVendor.bookingDeadlineDays,
      bookingDeadline: deadline,
      status: 'not_contacted',
      vendorName: newVendor.vendorName.trim() || undefined,
      questionsToAsk: [
        'What is your cancellation and date reschedule policy?',
        'Do you provide an itemized formal invoice for all costs?',
      ],
    };

    persistEventChanges({
      ...event,
      vendors: [...event.vendors, vendorItem],
    });

    setShowAddVendorModal(false);
    setNewVendor({
      service: '',
      category: 'other',
      targetBudget: 5000,
      bookingDeadlineDays: 10,
      vendorName: '',
    });
    showToast('Vendor added');
  };

  // --- IDEA ACTIONS ---
  const handleToggleFavoriteIdea = (ideaId: string) => {
    const updatedIdeas = event.ideas.map((i) => {
      if (i.id === ideaId) {
        return { ...i, isFavorite: !i.isFavorite };
      }
      return i;
    });

    persistEventChanges({
      ...event,
      ideas: updatedIdeas,
    });
  };

  // Safe Partial Regeneration (does not overwrite user-edited actual costs or completed tasks)
  const handleRegenerateSection = async (section: 'ideas' | 'timeline') => {
    setIsRegenerating(true);
    showToast(`Refreshing ${section}...`);

    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: event.title,
          eventType: event.eventType,
          eventDate: event.eventDate,
          city: event.city,
          guestCount: event.guestCount,
          totalBudget: event.totalBudget,
          venueType: event.venueType,
          sectionToRegenerate: section,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        if (section === 'ideas' && data.data.ideas) {
          // Keep favorite ideas, merge new ones
          const favorites = event.ideas.filter((i) => i.isFavorite);
          const newIdeas = data.data.ideas.map(
            (
              item: {
                title: string;
                category: string;
                description: string;
                whyItFits: string;
                costImpact: 'low' | 'medium' | 'high' | 'free';
                effortLevel: 'easy' | 'moderate' | 'challenging';
              },
              idx: number
            ) => ({
              id: `regen-i-${idx + 1}-${Date.now()}`,
              title: item.title,
              category: item.category,
              description: item.description,
              whyItFits: item.whyItFits,
              costImpact: item.costImpact,
              effortLevel: item.effortLevel,
              isFavorite: false,
            })
          );

          persistEventChanges({
            ...event,
            ideas: [...favorites, ...newIdeas],
          });
          showToast('Fresh ideas generated!');
        }
      } else {
        showToast(data.message || 'Regeneration unavailable in demo mode');
      }
    } catch {
      showToast('Could not reach Gemini service');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteEvent = () => {
    deleteEvent(event.id);
    router.push('/dashboard');
  };

  // Filter tasks based on selected filters
  const filteredTasks = event.tasks.filter((t) => {
    if (taskCategoryFilter !== 'all' && t.category !== taskCategoryFilter) {
      return false;
    }
    if (taskStatusFilter === 'completed' && !t.isCompleted) return false;
    if (taskStatusFilter === 'pending' && t.isCompleted) return false;
    if (taskStatusFilter === 'overdue' && !isTaskOverdue(t)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#182620] text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-[#C85A32]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Workspace Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DDD3] pb-4 no-print">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6E64] hover:text-[#182620] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          {event.isDemo && (
            <Badge variant="coral" size="sm">
              Demonstration Plan
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print / Save PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadEventJSONFile(event)}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Backup
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            aria-label="Delete Event Plan"
            className="text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Event Header Banner */}
      <Card className="bg-white border-[#D4C6B6] p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="sage" size="sm">
                {event.eventType.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-xs text-[#5C6E64] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <strong>{formatDate(event.eventDate)}</strong> ({countdown.text})
              </span>
              <span className="text-xs text-[#5C6E64]">
                • {event.city} • {event.guestCount} Guests •{' '}
                <span className="capitalize">{event.venueType}</span> Venue
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182620] tracking-tight">
              {event.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C6E64] max-w-3xl leading-relaxed">
              {event.concept.conceptDescription}
            </p>
          </div>

          {/* Interactive Readiness Score Indicator */}
          <div className="shrink-0 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD3] text-center sm:text-right space-y-1">
            <div className="text-[11px] font-bold text-[#5C6E64] uppercase tracking-wider flex items-center justify-center sm:justify-end gap-1">
              <span>Readiness Score</span>
              <button
                onClick={() => setShowReadinessBreakdown(!showReadinessBreakdown)}
                className="text-[#2D5A43] hover:underline cursor-pointer"
                title="Toggle score factors"
              >
                {showReadinessBreakdown ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="text-3xl font-black text-[#2D5A43]">
              {readiness.overallScore}
              <span className="text-sm font-medium text-[#5C6E64]">/100</span>
            </div>

            <div className="text-[11px] text-[#5C6E64]">
              {readiness.completedTasks} of {readiness.totalTasks} tasks complete
            </div>
          </div>
        </div>

        {/* Expandable Mathematical Readiness Breakdown */}
        {showReadinessBreakdown && (
          <div className="pt-4 border-t border-[#E5DDD3] space-y-3 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#182620]">
              Score Calculation Breakdown (Deterministic Multi-Factor Formula)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {readiness.details.map((factor) => (
                <div
                  key={factor.label}
                  className="p-3 rounded-xl bg-white border border-[#E5DDD3] space-y-1"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[#182620]">{factor.label}</span>
                    <span className="text-[#2D5A43]">
                      {factor.score}/{factor.maxScore} pts
                    </span>
                  </div>
                  <ProgressBar
                    value={factor.score}
                    max={factor.maxScore}
                    size="sm"
                    color="sage"
                  />
                  <p className="text-[11px] text-[#5C6E64] pt-1">{factor.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Alerts Banner if any */}
        {readiness.criticalAlerts.length > 0 && (
          <div className="pt-3 border-t border-[#E5DDD3] space-y-2">
            {readiness.criticalAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                  alert.type === 'danger'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    alert.type === 'danger' ? 'text-rose-600' : 'text-amber-600'
                  }`}
                />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <strong className="font-bold mr-1">{alert.title}:</strong>
                    <span>{alert.message}</span>
                  </div>
                  {alert.actionTab && (
                    <button
                      onClick={() => setActiveTab(alert.actionTab as TabType)}
                      className="font-bold underline text-xs shrink-0 cursor-pointer text-left"
                    >
                      View in {alert.actionTab} →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E5DDD3] gap-2 overflow-x-auto no-print">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'budget', label: 'Budget Engine', icon: Wallet },
          { id: 'timeline', label: 'Timeline & Checklist', icon: CheckCircle2 },
          { id: 'vendors', label: 'Vendors Pipeline', icon: Users },
          { id: 'ideas', label: 'Curated Ideas', icon: Lightbulb },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#2D5A43] text-[#2D5A43] bg-white rounded-t-xl'
                  : 'border-transparent text-[#5C6E64] hover:text-[#182620]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: OVERVIEW
      ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Concept & Palette Card */}
            <Card className="lg:col-span-2 p-6 space-y-4 bg-white">
              <h2 className="text-base font-bold text-[#182620] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C85A32]" />
                Event Concept & Cultural Rationale
              </h2>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#2D5A43]">
                  {event.concept.themeName}
                </h3>
                <p className="text-xs text-[#5C6E64] leading-relaxed">
                  {event.concept.personalizedRationale}
                </p>
              </div>

              {/* Color Palette Chips */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-[#5C6E64] uppercase tracking-wider block">
                  Suggested Color Harmony
                </span>
                <div className="flex flex-wrap gap-2">
                  {event.concept.suggestedColorPalette.map((palette) => (
                    <span
                      key={palette}
                      className="text-xs px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E5DDD3] text-[#182620] font-medium"
                    >
                      {palette}
                    </span>
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="pt-3 border-t border-[#E5DDD3] space-y-2">
                <span className="text-[11px] font-semibold text-[#5C6E64] uppercase tracking-wider block">
                  Planning Strategy
                </span>
                <p className="text-xs text-[#5C6E64] leading-relaxed">
                  {event.summary.approach}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {event.summary.keyPriorities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E5DDD3] flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-[#2D5A43]" />
                      <span className="text-[#182620] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Financial Snapshot */}
            <Card className="p-6 space-y-4 bg-white flex flex-col justify-between">
              <div className="space-y-3">
                <h2 className="text-base font-bold text-[#182620] flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#2D5A43]" />
                  Budget Utilization
                </h2>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#5C6E64]">Target Budget:</span>
                    <span className="font-bold text-[#182620]">
                      {formatINR(budgetSummary.totalBudget)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#5C6E64]">Committed Total:</span>
                    <span
                      className={`font-bold ${
                        budgetSummary.isOverBudget ? 'text-red-600' : 'text-[#2D5A43]'
                      }`}
                    >
                      {formatINR(budgetSummary.effectiveTotal)}
                    </span>
                  </div>
                  <ProgressBar
                    value={budgetSummary.utilizationPercentage}
                    size="md"
                    color={budgetSummary.isOverBudget ? 'red' : 'sage'}
                  />
                  <div className="flex justify-between text-[11px] text-[#5C6E64] pt-1">
                    <span>{budgetSummary.utilizationPercentage}% utilized</span>
                    <span>
                      {budgetSummary.isOverBudget
                        ? `Over by ${formatINR(budgetSummary.overspendingAmount)}`
                        : `${formatINR(budgetSummary.remainingBudget)} remaining`}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#5C6E64]">Paid Advance:</span>
                    <span className="font-semibold text-emerald-800">
                      {formatINR(budgetSummary.totalPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6E64]">Remaining to Pay:</span>
                    <span className="font-semibold text-amber-800">
                      {formatINR(budgetSummary.remainingToPay)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('budget')}
                className="w-full justify-center"
              >
                Open Full Budget Engine
              </Button>
            </Card>
          </div>

          {/* Key Upcoming Tasks & Vendors Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Checklist Milestones */}
            <Card className="p-6 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#182620] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                  Upcoming Task Milestones
                </h3>
                <span className="text-xs text-[#5C6E64]">
                  {taskProgress.completed} of {taskProgress.total} completed
                </span>
              </div>

              <div className="space-y-2">
                {event.tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="p-3 rounded-xl border border-[#E5DDD3] hover:border-[#2D5A43] bg-[#FAF7F2] flex items-start gap-3 transition-colors cursor-pointer"
                  >
                    <div className="mt-0.5">
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#5C6E64]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          task.isCompleted ? 'line-through text-[#5C6E64]' : 'text-[#182620]'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-[#5C6E64]">
                        Due {formatDate(task.dueDate)} ({getCountdownLabel(task.dueDate).text})
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('timeline')}
                className="w-full text-xs text-[#2D5A43]"
              >
                View all tasks in Timeline →
              </Button>
            </Card>

            {/* Vendor Pipeline Snapshot */}
            <Card className="p-6 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#182620] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C85A32]" />
                  Vendor Booking Pipeline
                </h3>
                <span className="text-xs text-[#5C6E64]">
                  {event.vendors.filter((v) => v.status === 'booked').length} of{' '}
                  {event.vendors.length} booked
                </span>
              </div>

              <div className="space-y-2">
                {event.vendors.slice(0, 4).map((vendor) => (
                  <div
                    key={vendor.id}
                    className="p-3 rounded-xl border border-[#E5DDD3] bg-[#FAF7F2] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="block text-[#182620]">{vendor.service}</strong>
                      <span className="text-[11px] text-[#5C6E64]">
                        Budget: {formatINR(vendor.targetBudget)}
                      </span>
                    </div>

                    <Badge
                      variant={
                        vendor.status === 'booked'
                          ? 'sage'
                          : vendor.status === 'shortlisted'
                          ? 'amber'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {vendor.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('vendors')}
                className="w-full text-xs text-[#2D5A43]"
              >
                Manage all vendors in Pipeline →
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: DETERMINISTIC BUDGET ENGINE
      ======================================================== */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Budget Health Card */}
          <Card className="p-6 bg-white border-[#D4C6B6] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#182620]">
                  Deterministic Financial Summary
                </h2>
                <p className="text-xs text-[#5C6E64]">
                  Integer INR calculations. All user edits persist locally and recalculate totals automatically.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddExpenseModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Custom Expense
              </Button>
            </div>

            {/* Key Totals Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
                <span className="text-[10px] text-[#5C6E64] uppercase font-bold block">
                  Target Budget
                </span>
                <span className="text-xl font-black text-[#182620]">
                  {formatINR(budgetSummary.totalBudget)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
                <span className="text-[10px] text-[#5C6E64] uppercase font-bold block">
                  Committed Spend
                </span>
                <span
                  className={`text-xl font-black ${
                    budgetSummary.isOverBudget ? 'text-red-600' : 'text-[#2D5A43]'
                  }`}
                >
                  {formatINR(budgetSummary.effectiveTotal)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
                <span className="text-[10px] text-[#5C6E64] uppercase font-bold block">
                  Remaining Buffer
                </span>
                <span
                  className={`text-xl font-black ${
                    budgetSummary.isOverBudget ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {formatINR(budgetSummary.remainingBudget)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
                <span className="text-[10px] text-[#5C6E64] uppercase font-bold block">
                  Total Paid Advance
                </span>
                <span className="text-xl font-black text-[#182620]">
                  {formatINR(budgetSummary.totalPaid)}
                </span>
              </div>
            </div>

            {/* Overspending Banner if applicable */}
            {budgetSummary.isOverBudget && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-xs text-red-900 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Budget Limit Exceeded by {formatINR(budgetSummary.overspendingAmount)}
                </div>
                <p>
                  Actual or estimated allocations exceed your target budget. Consider applying the cost-saving opportunities listed below.
                </p>
              </div>
            )}

            {/* Category Breakdown Progress Grid */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#182620]">
                Category-wise Allocation & Spend
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {budgetSummary.categoryBreakdown.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3] space-y-1.5"
                  >
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#182620]">{cat.label}</span>
                      <span className="text-[#2D5A43]">{cat.percentage}%</span>
                    </div>
                    <ProgressBar value={cat.percentage} size="sm" color="sage" />
                    <div className="flex justify-between text-[11px] text-[#5C6E64]">
                      <span>{formatINR(cat.actual)}</span>
                      <span>{cat.itemCount} item(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Interactive Editable Budget Table */}
          <Card className="bg-white border-[#E5DDD3] p-6 space-y-4 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-[#182620]">
              Itemized Expenses & Vendor Costs (Edit to update totals)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DDD3] text-[#5C6E64] uppercase font-bold text-[10px]">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Item Description & Basis</th>
                    <th className="py-2.5 px-3 w-32">Estimated (₹)</th>
                    <th className="py-2.5 px-3 w-32">Actual / Quote (₹)</th>
                    <th className="py-2.5 px-3 w-28">Paid (₹)</th>
                    <th className="py-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DDD3]">
                  {event.budgetItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-3">
                        <Badge variant="neutral" size="sm">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <strong className="block text-[#182620]">{item.description}</strong>
                        {item.basis && (
                          <span className="text-[11px] text-[#5C6E64] block">{item.basis}</span>
                        )}
                        {item.assumptions && (
                          <span className="text-[10px] text-[#5C6E64] italic block">
                            Note: {item.assumptions}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step={100}
                          value={item.estimatedCost}
                          onChange={(e) =>
                            handleUpdateCost(item.id, 'estimatedCost', parseInt(e.target.value, 10))
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-[#D4C6B6] bg-white text-[#182620] text-xs font-medium"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step={100}
                          placeholder={item.estimatedCost.toString()}
                          value={item.actualCost ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                            handleUpdateCost(item.id, 'actualCost', val);
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-[#2D5A43] bg-white text-[#182620] text-xs font-bold"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step={100}
                          value={item.paidAmount ?? 0}
                          onChange={(e) =>
                            handleUpdateCost(item.id, 'paidAmount', parseInt(e.target.value, 10))
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-[#D4C6B6] bg-white text-[#182620] text-xs"
                        />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleDeleteExpense(item.id)}
                          aria-label="Delete expense item"
                          className="p-1 rounded-md text-[#5C6E64] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================
          TAB 3: TIMELINE & CHECKLIST
      ======================================================== */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-[#D4C6B6] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#182620]">
                  Timeline & Preparation Checklist
                </h2>
                <p className="text-xs text-[#5C6E64]">
                  Relative offsets converted to dates via date-fns. Check off tasks as you finish them.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegenerateSection('timeline')}
                  isLoading={isRegenerating}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Regenerate Tasks
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddTaskModal(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Custom Task
                </Button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[#5C6E64] font-medium">Status:</span>
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Only</option>
                  <option value="completed">Completed Only</option>
                  <option value="overdue">Overdue Only</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#5C6E64] font-medium">Category:</span>
                <select
                  value={taskCategoryFilter}
                  onChange={(e) => setTaskCategoryFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(TASK_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="p-8 text-center text-xs text-[#5C6E64] bg-white">
                No tasks match the selected filters.
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const overdue = isTaskOverdue(task);
                const depCheck = checkTaskDependencies(task, event.tasks);
                const priorityBadge = TASK_PRIORITY_BADGES[task.priority];

                return (
                  <Card
                    key={task.id}
                    className={`p-4 transition-all border ${
                      task.isCompleted
                        ? 'bg-[#FAF7F2] border-[#E5DDD3] opacity-75'
                        : overdue
                        ? 'bg-rose-50/50 border-rose-300'
                        : 'bg-white border-[#E5DDD3] hover:border-[#2D5A43]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Interactive Checkbox */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        aria-label={`Mark "${task.title}" as ${
                          task.isCompleted ? 'incomplete' : 'complete'
                        }`}
                        className="mt-1 p-0.5 text-[#2D5A43] hover:scale-110 transition-transform cursor-pointer"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-[#2D5A43] fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#5C6E64]" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-sm font-bold ${
                              task.isCompleted
                                ? 'line-through text-[#5C6E64]'
                                : 'text-[#182620]'
                            }`}
                          >
                            {task.title}
                          </h3>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${priorityBadge.bg} ${priorityBadge.text} ${priorityBadge.border}`}
                          >
                            {task.priority}
                          </span>

                          <Badge variant="neutral" size="sm">
                            {TASK_CATEGORY_LABELS[task.category] || task.category}
                          </Badge>
                        </div>

                        <p className="text-xs text-[#5C6E64] leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#5C6E64]">
                          <span
                            className={`font-medium ${
                              overdue ? 'text-red-600 font-bold' : ''
                            }`}
                          >
                            Due: {formatDate(task.dueDate)} ({getCountdownLabel(task.dueDate).text})
                          </span>

                          {task.estimatedDuration && (
                            <span>Estimated Duration: {task.estimatedDuration}</span>
                          )}

                          {depCheck.isBlocked && (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Prerequisite uncompleted: {depCheck.missingDependencies[0]?.title}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label="Delete task"
                        className="p-1 rounded-md text-[#5C6E64] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: VENDORS PIPELINE
      ======================================================== */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-[#D4C6B6] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#182620]">Vendor Management</h2>
                <p className="text-xs text-[#5C6E64]">
                  Track quotations, contact notes, and key interview questions for every service provider.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddVendorModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Custom Vendor
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.vendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="p-5 bg-white border-[#E5DDD3] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="sage" size="sm" className="mb-1">
                        {CATEGORY_LABELS[vendor.category] || vendor.category}
                      </Badge>
                      <h3 className="text-base font-bold text-[#182620]">{vendor.service}</h3>
                      <span className="text-xs text-[#5C6E64] block">
                        Target Budget: {formatINR(vendor.targetBudget)} • Due by{' '}
                        {formatDate(vendor.bookingDeadline)}
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={vendor.status}
                      onChange={(e) =>
                        handleUpdateVendorStatus(vendor.id, e.target.value as VendorStatus)
                      }
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-[#D4C6B6] bg-[#FAF7F2] text-[#182620] font-bold"
                    >
                      <option value="not_contacted">Not Contacted</option>
                      <option value="contacted">Contacted</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="booked">Booked</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>

                  {/* Vendor Name & Contact Inputs */}
                  <div className="space-y-2 pt-1 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-[#5C6E64] uppercase block">
                        Vendor Provider Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Caterers / Lakeview Terrace"
                        value={vendor.vendorName || ''}
                        onChange={(e) =>
                          handleUpdateVendorNotes(vendor.id, 'vendorName', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4C6B6] bg-white text-[#182620] text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5C6E64] uppercase block">
                        Contact & Quotation Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Phone, agreed inclusions, payment terms..."
                        value={vendor.quotationNotes || ''}
                        onChange={(e) =>
                          handleUpdateVendorNotes(vendor.id, 'quotationNotes', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4C6B6] bg-white text-[#182620] text-xs"
                      />
                    </div>
                  </div>

                  {/* Curated Questions to Ask */}
                  {vendor.questionsToAsk && vendor.questionsToAsk.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3] space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-[#2D5A43] uppercase tracking-wider block">
                        Recommended Questions to Ask Before Booking:
                      </span>
                      <ul className="space-y-1 text-[#5C6E64]">
                        {vendor.questionsToAsk.map((q, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#C85A32]">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: CURATED IDEAS & RISKS
      ======================================================== */}
      {activeTab === 'ideas' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-[#D4C6B6] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#182620]">
                  Personalized Celebration Ideas & Contingencies
                </h2>
                <p className="text-xs text-[#5C6E64]">
                  Tailored themes, activities, and budget-saving alternatives. Click the star to favorite.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRegenerateSection('ideas')}
                isLoading={isRegenerating}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Regenerate Ideas
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.ideas.map((idea) => (
              <Card
                key={idea.id}
                className={`p-5 space-y-3 flex flex-col justify-between transition-all border ${
                  idea.isFavorite
                    ? 'bg-[#FDF1EB]/60 border-[#F2CBB9] shadow-xs'
                    : 'bg-white border-[#E5DDD3]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="coral" size="sm" className="capitalize">
                      {idea.category.replace('_', ' ')}
                    </Badge>

                    <button
                      onClick={() => handleToggleFavoriteIdea(idea.id)}
                      aria-label="Toggle favorite"
                      className="p-1 rounded-lg text-[#5C6E64] hover:text-[#C85A32] transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          idea.isFavorite ? 'text-[#C85A32] fill-current' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-[#182620]">{idea.title}</h3>
                  <p className="text-xs text-[#5C6E64] leading-relaxed">
                    {idea.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white/80 border border-[#E5DDD3] text-[11px] text-[#2D5A43] space-y-0.5">
                    <strong>Why it fits:</strong>
                    <p className="text-[#5C6E64]">{idea.whyItFits}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#5C6E64] pt-2 border-t border-[#E5DDD3]">
                  <span>Cost Impact: <strong className="capitalize">{idea.costImpact}</strong></span>
                  <span>Effort: <strong className="capitalize">{idea.effortLevel}</strong></span>
                </div>
              </Card>
            ))}
          </div>

          {/* Identified Risks & Contingencies */}
          <div className="pt-6 space-y-4">
            <h3 className="text-sm font-bold text-[#182620] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C85A32]" />
              Identified Celebration Risks & Contingency Alternatives
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.risks.map((risk) => (
                <Card
                  key={risk.id}
                  className="p-4 bg-white border-[#E5DDD3] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-[#182620]">{risk.risk}</strong>
                    <Badge
                      variant={
                        risk.severity === 'high'
                          ? 'red'
                          : risk.severity === 'medium'
                          ? 'amber'
                          : 'sage'
                      }
                      size="sm"
                    >
                      {risk.severity.toUpperCase()} SEVERITY
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#2D5A43] block">
                      Practical Mitigation:
                    </span>
                    <p className="text-[#5C6E64]">{risk.mitigation}</p>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-[#E5DDD3]">
                    <span className="text-[11px] font-bold text-[#C85A32] block">
                      Low-Cost Alternative:
                    </span>
                    <p className="text-[#5C6E64]">{risk.alternative}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODALS & CONFIRMATIONS
      ======================================================== */}
      {/* Delete Event Confirmation Modal */}
      <Dialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Celebration Plan?"
        description="Are you sure you want to permanently delete this event plan from local storage?"
        confirmLabel="Yes, Delete Plan"
        confirmVariant="danger"
        onConfirm={handleDeleteEvent}
      />

      {/* Add Custom Expense Modal */}
      <Dialog
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        title="Add Expense Item"
        confirmLabel="Add Expense"
        onConfirm={handleCreateExpense}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold block mb-1">Item Description</label>
            <input
              type="text"
              placeholder="e.g. Welcome Drinks Bar, Sound operator tip"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Category</label>
              <select
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    category: e.target.value as BudgetItem['category'],
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Estimated Cost in INR (₹)</label>
              <input
                type="number"
                step={100}
                value={newExpense.estimatedCost}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    estimatedCost: parseInt(e.target.value, 10),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Basis / Assumption (Optional)</label>
            <input
              type="text"
              placeholder="e.g. ₹500/guest or fixed flat package"
              value={newExpense.basis}
              onChange={(e) => setNewExpense({ ...newExpense, basis: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>
        </div>
      </Dialog>

      {/* Add Custom Task Modal */}
      <Dialog
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        title="Add Preparation Task"
        confirmLabel="Add Task"
        onConfirm={handleCreateTask}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold block mb-1">Task Title</label>
            <input
              type="text"
              placeholder="e.g. Order custom milestone bento cake"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Actionable details and checklist reminders..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>
        </div>
      </Dialog>

      {/* Add Custom Vendor Modal */}
      <Dialog
        isOpen={showAddVendorModal}
        onClose={() => setShowAddVendorModal(false)}
        title="Add Vendor Partner"
        confirmLabel="Add Vendor"
        onConfirm={handleCreateVendor}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold block mb-1">Service Required</label>
            <input
              type="text"
              placeholder="e.g. Acoustic Duo Guitarist, Jute Decorator"
              value={newVendor.service}
              onChange={(e) => setNewVendor({ ...newVendor, service: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Vendor Provider Name (Optional)</label>
              <input
                type="text"
                placeholder="Business or contact name"
                value={newVendor.vendorName}
                onChange={(e) => setNewVendor({ ...newVendor, vendorName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Target Budget in INR (₹)</label>
              <input
                type="number"
                step={500}
                value={newVendor.targetBudget}
                onChange={(e) =>
                  setNewVendor({
                    ...newVendor,
                    targetBudget: parseInt(e.target.value, 10),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
