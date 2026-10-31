'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Wallet,
  CheckCircle2,
  Users,
  Lightbulb,
  LucideIcon,
  Printer,
  Download,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EventPlan, ReadinessScoreBreakdown } from '@/types/event';
import { downloadEventJSONFile } from '@/utils/storage';
import { formatDate, getCountdownLabel } from '@/utils/formatters';
import { EventTab, isEventTab } from './types';

const TABS: { id: EventTab; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'budget', label: 'Budget Engine', icon: Wallet },
  { id: 'timeline', label: 'Timeline & Checklist', icon: CheckCircle2 },
  { id: 'vendors', label: 'Vendors Pipeline', icon: Users },
  { id: 'ideas', label: 'Curated Ideas', icon: Lightbulb },
];

interface EventWorkspaceHeaderProps {
  event: EventPlan;
  readiness: ReadinessScoreBreakdown;
  activeTab: EventTab;
  onTabChange: (tab: EventTab) => void;
  onDeleteRequest: () => void;
}

export function EventWorkspaceHeader({
  event,
  readiness,
  activeTab,
  onTabChange,
  onDeleteRequest,
}: EventWorkspaceHeaderProps) {
  const [showReadinessBreakdown, setShowReadinessBreakdown] = useState(false);
  const countdown = useMemo(() => getCountdownLabel(event.eventDate), [event.eventDate]);

  return (
    <>
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
            onClick={onDeleteRequest}
            aria-label="Delete Event Plan"
            className="text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

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

          <div className="shrink-0 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD3] text-center sm:text-right space-y-1">
            <div className="text-[11px] font-bold text-[#5C6E64] uppercase tracking-wider flex items-center justify-center sm:justify-end gap-1">
              <span>Readiness Score</span>
              <button
                onClick={() => setShowReadinessBreakdown((current) => !current)}
                className="text-[#2D5A43] hover:underline cursor-pointer"
                aria-label={
                  showReadinessBreakdown
                    ? 'Hide readiness score breakdown'
                    : 'Show readiness score breakdown'
                }
                aria-expanded={showReadinessBreakdown}
                aria-controls="readiness-breakdown"
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

        {showReadinessBreakdown && (
          <div
            id="readiness-breakdown"
            className="pt-4 border-t border-[#E5DDD3] space-y-3 animate-in fade-in duration-150"
          >
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

        {readiness.criticalAlerts.length > 0 && (
          <div className="pt-3 border-t border-[#E5DDD3] space-y-2">
            {readiness.criticalAlerts.map((alert) => {
              const actionTab =
                alert.actionTab && isEventTab(alert.actionTab) ? alert.actionTab : null;

              return (
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
                    {actionTab && (
                      <button
                        onClick={() => onTabChange(actionTab)}
                        className="font-bold underline text-xs shrink-0 cursor-pointer text-left"
                      >
                        View in {actionTab} →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div
        role="tablist"
        aria-label="Event workspace sections"
        className="flex border-b border-[#E5DDD3] gap-2 overflow-x-auto no-print"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
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
    </>
  );
}
