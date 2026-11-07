import type { AnchorHTMLAttributes, ButtonHTMLAttributes, Ref } from 'react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  ref?: Ref<HTMLButtonElement>;
};
export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
};

function buttonClassName(variant: ButtonVariant, className?: string) {
  return cn('ds-button', `ds-button--${variant}`, className);
}

export function Button({
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={buttonClassName(variant, className)}
      type={type}
    />
  );
}

export function ButtonLink({
  className,
  variant = 'primary',
  ...props
}: ButtonLinkProps) {
  return <a {...props} className={buttonClassName(variant, className)} />;
}
