'use client';

import { RefreshCw, ShieldAlert, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EventPlan } from '@/types/event';

interface IdeasTabProps {
  event: EventPlan;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onToggleFavorite: (ideaId: string) => void;
}

export function IdeasTab({
  event,
  isRegenerating,
  onRegenerate,
  onToggleFavorite,
}: IdeasTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border-[#D4C6B6] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#182620]">
              Personalized Celebration Ideas & Contingencies
            </h2>
            <p className="text-xs text-[#5C6E64]">
              Tailored themes, activities, and budget-saving alternatives. Click the star to
              favorite.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
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
                  onClick={() => onToggleFavorite(idea.id)}
                  aria-label="Toggle favorite"
                  className="p-1 rounded-lg text-[#5C6E64] hover:text-[#C85A32] transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${idea.isFavorite ? 'text-[#C85A32] fill-current' : ''}`}
                  />
                </button>
              </div>

              <h3 className="text-sm font-bold text-[#182620]">{idea.title}</h3>
              <p className="text-xs text-[#5C6E64] leading-relaxed">{idea.description}</p>

              <div className="p-2.5 rounded-lg bg-white/80 border border-[#E5DDD3] text-[11px] text-[#2D5A43] space-y-0.5">
                <strong>Why it fits:</strong>
                <p className="text-[#5C6E64]">{idea.whyItFits}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#5C6E64] pt-2 border-t border-[#E5DDD3]">
              <span>
                Cost Impact: <strong className="capitalize">{idea.costImpact}</strong>
              </span>
              <span>
                Effort: <strong className="capitalize">{idea.effortLevel}</strong>
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-6 space-y-4">
        <h3 className="text-sm font-bold text-[#182620] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#C85A32]" />
          Identified Celebration Risks & Contingency Alternatives
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {event.risks.map((risk) => (
            <Card key={risk.id} className="p-4 bg-white border-[#E5DDD3] space-y-2 text-xs">
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
  );
}
