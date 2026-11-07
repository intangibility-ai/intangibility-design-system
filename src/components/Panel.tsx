import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type PanelProps = {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export function Panel({
  title,
  actions,
  children,
  className,
  headerClassName,
  bodyClassName,
}: PanelProps) {
  return (
    <section className={cn('ds-panel', className)}>
      {title ? (
        <header className={cn('ds-panel-header', headerClassName)}>
          <span>{title}</span>
          {actions}
        </header>
      ) : null}
      <div className={cn('ds-panel-body', bodyClassName)}>{children}</div>
    </section>
  );
}
