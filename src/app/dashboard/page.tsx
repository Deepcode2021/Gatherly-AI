'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Sparkles,
  Calendar,
  Wallet,
  CheckCircle2,
  Trash2,
  Download,
  Upload,
  ArrowRight,
  Clock,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Dialog } from '@/components/ui/Dialog';
import {
  deleteEvent,
  loadDemoEventIntoStorage,
  downloadEventJSONFile,
  importEventFromJSON,
} from '@/utils/storage';
import { useEvents } from '@/utils/useEvents';
import { calculateBudgetSummary } from '@/utils/budget';
import { calculateEventReadiness } from '@/utils/readiness';
import { formatINR, formatDate, getCountdownLabel } from '@/utils/formatters';

export default function DashboardPage() {
  const events = useEvents();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleLoadDemo = () => {
    loadDemoEventIntoStorage();
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    deleteEvent(deleteTargetId);
    setDeleteTargetId(null);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importEventFromJSON(content);
      if (res.success && res.event) {
        const countMsg =
          res.importedCount && res.importedCount > 1
            ? `Successfully imported ${res.importedCount} celebrations!`
            : `Successfully imported "${res.event.title}"`;
        setImportSuccess(countMsg);
        setImportError(null);
      } else {
        setImportError(res.error || 'Failed to import backup plan');
        setImportSuccess(null);
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file. Please try again.');
      setImportSuccess(null);
    };
    reader.readAsText(file);
    // Reset file input so selecting the same file again triggers onChange
    e.target.value = '';
  };

  // Compute aggregate dashboard metrics
  const totalEvents = events.length;
  let totalAllocatedBudget = 0;
  let totalEffectiveSpend = 0;
  let totalCompletedTasks = 0;
  let totalTasksCount = 0;
  let upcomingDeadlinesCount = 0;

  for (const ev of events) {
    const summary = calculateBudgetSummary(ev.totalBudget, ev.budgetItems);
    totalAllocatedBudget += summary.totalBudget;
    totalEffectiveSpend += summary.effectiveTotal;

    for (const t of ev.tasks) {
      totalTasksCount++;
      if (t.isCompleted) {
        totalCompletedTasks++;
      } else {
        const diff = getCountdownLabel(t.dueDate).days;
        if (diff >= 0 && diff <= 7) {
          upcomingDeadlinesCount++;
        }
      }
    }
  }

  const overallTaskPercent =
    totalTasksCount > 0 ? Math.round((totalCompletedTasks / totalTasksCount) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDD3] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182620] tracking-tight">
            Planning Workspace
          </h1>
          <p className="text-sm text-[#5C6E64] mt-1">
            Manage your celebration budgets, vendor commitments, task timelines, and creative ideas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* JSON File Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileImport}
            className="hidden"
            aria-label="Import celebration JSON backup"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="w-4 h-4 text-[#5C6E64]" />}
          >
            Import JSON
          </Button>

          <Link href="/create">
            <Button
              variant="accent"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Import feedback notifications */}
      {importError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
          <span>{importError}</span>
          <button
            onClick={() => setImportError(null)}
            className="text-red-600 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {importSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{importSuccess}</span>
          <button
            onClick={() => setImportSuccess(null)}
            className="text-emerald-600 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Metrics Row */}
      {totalEvents > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0EB] text-[#2D5A43] flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#5C6E64] uppercase tracking-wider block">
                Active Events
              </span>
              <span className="text-2xl font-black text-[#182620]">{totalEvents}</span>
              <span className="text-[11px] text-[#5C6E64] block">Saved in local browser</span>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF1EB] text-[#C85A32] flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#5C6E64] uppercase tracking-wider block">
                Total Budget
              </span>
              <span className="text-2xl font-black text-[#182620]">
                {formatINR(totalAllocatedBudget)}
              </span>
              <span className="text-[11px] text-[#5C6E64] block">
                {formatINR(totalEffectiveSpend)} committed
              </span>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#5C6E64] uppercase tracking-wider block">
                Task Execution
              </span>
              <span className="text-2xl font-black text-[#182620]">
                {overallTaskPercent}%
              </span>
              <span className="text-[11px] text-[#5C6E64] block">
                {totalCompletedTasks} of {totalTasksCount} tasks done
              </span>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-800 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#5C6E64] uppercase tracking-wider block">
                Due This Week
              </span>
              <span className="text-2xl font-black text-[#182620]">
                {upcomingDeadlinesCount}
              </span>
              <span className="text-[11px] text-[#5C6E64] block">
                Across all active plans
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Events List / Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#182620]">Your Celebration Plans</h2>
          {events.length > 0 && (
            <button
              onClick={handleLoadDemo}
              className="text-xs font-medium text-[#2D5A43] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              Reset / Load Demo Event
            </button>
          )}
        </div>

        {events.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center bg-white border-dashed border-2 border-[#D4C6B6] space-y-6 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F0EB] text-[#2D5A43] mx-auto flex items-center justify-center">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#182620]">No celebrations planned yet</h3>
              <p className="text-xs text-[#5C6E64] max-w-md mx-auto leading-relaxed">
                Start by creating your first celebration plan with our AI assistant, or load our complete Bhopal 30th birthday demo plan to explore the workspace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/create" className="w-full sm:w-auto">
                <Button variant="accent" size="md" className="w-full">
                  Create First Event
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto border-[#D4C6B6]"
                leftIcon={<Upload className="w-4 h-4 text-[#5C6E64]" />}
              >
                Import Backup JSON
              </Button>
              <Button
                variant="ghost"
                size="md"
                type="button"
                onClick={handleLoadDemo}
                className="w-full sm:w-auto"
                leftIcon={<Sparkles className="w-4 h-4 text-[#C85A32]" />}
              >
                Load Bhopal Demo
              </Button>
            </div>
          </Card>
        ) : (
          /* Grid of Event Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const readiness = calculateEventReadiness(event);
              const countdown = getCountdownLabel(event.eventDate);

              return (
                <Card
                  key={event.id}
                  className="bg-white border-[#E5DDD3] hover:border-[#2D5A43] transition-all p-5 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="sage" size="sm">
                            {event.eventType.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {event.isDemo && (
                            <Badge variant="coral" size="sm">
                              DEMO
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-[#182620] line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="text-xs text-[#5C6E64] flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(event.eventDate)}</span>
                          <span>•</span>
                          <span
                            className={
                              countdown.isOverdue ? 'text-red-600 font-medium' : 'text-[#2D5A43]'
                            }
                          >
                            {countdown.text}
                          </span>
                        </p>
                      </div>

                      {/* Readiness score pill */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-[#5C6E64] uppercase font-semibold block">
                          Readiness
                        </span>
                        <span className="text-lg font-black text-[#2D5A43]">
                          {readiness.overallScore}
                          <span className="text-[10px] font-normal text-[#5C6E64]">/100</span>
                        </span>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
                      <div>
                        <span className="text-[10px] text-[#5C6E64] block">City & Guests</span>
                        <span className="font-semibold text-[#182620] truncate block">
                          {event.city} • {event.guestCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5C6E64] block">Budget</span>
                        <span className="font-semibold text-[#182620] block">
                          {formatINR(event.totalBudget)}
                        </span>
                      </div>
                    </div>

                    {/* Task Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#5C6E64]">Checklist Progress</span>
                        <span className="font-semibold text-[#182620]">
                          {readiness.completedTasks} / {readiness.totalTasks}
                        </span>
                      </div>
                      <ProgressBar
                        value={readiness.completedTasks}
                        max={readiness.totalTasks || 1}
                        size="sm"
                        color="sage"
                      />
                    </div>

                    {/* Critical Alert Warning if any */}
                    {readiness.criticalAlerts.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">{readiness.criticalAlerts[0].title}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-[#E5DDD3] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadEventJSONFile(event)}
                        title="Download JSON backup"
                        className="p-1.5 rounded-lg text-[#5C6E64] hover:bg-[#F2ECE4] hover:text-[#182620] transition-colors cursor-pointer"
                        aria-label="Export JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(event.id)}
                        title="Delete event"
                        className="p-1.5 rounded-lg text-[#5C6E64] hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                        aria-label="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link href={`/events/${event.id}`}>
                      <Button
                        size="sm"
                        variant="primary"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Open Workspace
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Celebration Plan?"
        description="Are you sure you want to delete this event? This action will permanently remove all tasks, budget customizations, and vendor logs from your browser."
        confirmLabel="Yes, Delete Plan"
        confirmVariant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
