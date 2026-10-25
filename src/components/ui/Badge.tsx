import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sage' | 'coral' | 'amber' | 'neutral' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    sage: 'bg-[#E8F0EB] text-[#1F3E2E] border border-[#C5D9CD]',
    coral: 'bg-[#FDF1EB] text-[#943916] border border-[#F2CBB9]',
    amber: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    neutral: 'bg-[#F2ECE4] text-[#4A5950] border border-[#E5DDD3]',
    red: 'bg-red-50 text-red-700 border border-red-200',
    blue: 'bg-sky-50 text-sky-800 border border-sky-200',
    purple: 'bg-purple-50 text-purple-800 border border-purple-200',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-full tracking-wide',
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
