import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  color?: 'sage' | 'coral' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  color = 'sage',
  size = 'md',
  label,
  showPercent = false,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    sage: 'bg-[#2D5A43]',
    coral: 'bg-[#C85A32]',
    amber: 'bg-[#D97706]',
    red: 'bg-red-600',
  };

  return (
    <div className={twMerge('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-[#4A5950]">
          {label && <span>{label}</span>}
          {showPercent && <span>{percent}%</span>}
        </div>
      )}
      <div
        className={twMerge(
          'w-full bg-[#E5DDD3] rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={twMerge(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
