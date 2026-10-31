'use client';

import { useMemo } from 'react';
import {
  Sparkles,
  Wallet,
  CheckCircle2,
  Circle,
  Users,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BudgetSummary, EventPlan } from '@/types/event';
import { getTaskProgress } from '@/utils/timeline';
import { formatINR, formatDate, getCountdownLabel } from '@/utils/formatters';
import { EventTab } from './types';

interface OverviewTabProps {
  event: EventPlan;
  budgetSummary: BudgetSummary;
  onToggleTask: (taskId: string) => void;
  onNavigate: (tab: EventTab) => void;
}

export function OverviewTab({
  event,
  budgetSummary,
  onToggleTask,
  onNavigate,
}: OverviewTabProps) {
  const taskProgress = useMemo(() => getTaskProgress(event.tasks), [event.tasks]);
  const upcomingTasks = useMemo(
    () =>
      event.tasks.slice(0, 4).map((task) => ({
        task,
        countdown: getCountdownLabel(task.dueDate),
      })),
    [event.tasks]
  );
  const bookedVendors = useMemo(
    () => event.vendors.filter((vendor) => vendor.status === 'booked').length,
    [event.vendors]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4 bg-white">
          <h2 className="text-base font-bold text-[#182620] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            Event Concept & Cultural Rationale
          </h2>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#2D5A43]">{event.concept.themeName}</h3>
            <p className="text-xs text-[#5C6E64] leading-relaxed">
              {event.concept.personalizedRationale}
            </p>
          </div>

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

          <div className="pt-3 border-t border-[#E5DDD3] space-y-2">
            <span className="text-[11px] font-semibold text-[#5C6E64] uppercase tracking-wider block">
              Planning Strategy
            </span>
            <p className="text-xs text-[#5C6E64] leading-relaxed">{event.summary.approach}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
              {event.summary.keyPriorities.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E5DDD3] flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-[#2D5A43]" />
                  <span className="text-[#182620] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

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
            onClick={() => onNavigate('budget')}
            className="w-full justify-center"
          >
            Open Full Budget Engine
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {upcomingTasks.map(({ task, countdown }) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggleTask(task.id)}
                aria-label={`Mark "${task.title}" as ${
                  task.isCompleted ? 'incomplete' : 'complete'
                }`}
                aria-pressed={task.isCompleted}
                className="w-full text-left p-3 rounded-xl border border-[#E5DDD3] hover:border-[#2D5A43] bg-[#FAF7F2] flex items-start gap-3 transition-colors cursor-pointer"
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
                    Due {formatDate(task.dueDate)} ({countdown.text})
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('timeline')}
            className="w-full text-xs text-[#2D5A43]"
          >
            View all tasks in Timeline →
          </Button>
        </Card>

        <Card className="p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#182620] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C85A32]" />
              Vendor Booking Pipeline
            </h3>
            <span className="text-xs text-[#5C6E64]">
              {bookedVendors} of {event.vendors.length} booked
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
            onClick={() => onNavigate('vendors')}
            className="w-full text-xs text-[#2D5A43]"
          >
            Manage all vendors in Pipeline →
          </Button>
        </Card>
      </div>
    </div>
  );
}
