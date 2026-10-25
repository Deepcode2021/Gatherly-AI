import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'muted' | 'accent' | 'highlight';
}

export function Card({
  children,
  className,
  variant = 'default',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-[#E5DDD3] shadow-xs',
    elevated: 'bg-white border border-[#D4C6B6] shadow-md',
    muted: 'bg-[#FAF7F2] border border-[#E5DDD3]',
    accent: 'bg-[#FDF1EB] border border-[#F2CBB9]',
    highlight: 'bg-[#E8F0EB] border border-[#C5D9CD]',
  };

  return (
    <div
      className={twMerge(
        clsx('rounded-2xl p-5 transition-all text-[#182620]', variantStyles[variant], className)
      )}
      {...props}
    >
      {children}
    </div>
  );
}
