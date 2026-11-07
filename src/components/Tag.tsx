import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type TagTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type TagProps = {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
};

export function Tag({ children, tone = 'neutral', className }: TagProps) {
  return (
    <span className={cn('ds-tag', `ds-tag--${tone}`, className)}>
      {children}
    </span>
  );
}
