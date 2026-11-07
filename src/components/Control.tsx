import type { ComponentPropsWithRef } from 'react';
import { cn } from '../lib/cn';

export type InputProps = ComponentPropsWithRef<'input'>;
export type TextareaProps = ComponentPropsWithRef<'textarea'>;

export function Input({ className, ...props }: InputProps) {
  return <input {...props} className={cn('ds-control', className)} />;
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn('ds-control', 'ds-textarea', className)}
    />
  );
}
