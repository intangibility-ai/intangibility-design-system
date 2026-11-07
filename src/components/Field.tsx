import {
  cloneElement,
  Fragment,
  isValidElement,
  useId,
  type AriaAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';

export type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
  interactiveLabel?: boolean;
};

type ControlAttributes = AriaAttributes & { id?: string };

export function Field({
  label,
  hint,
  error,
  children,
  className,
  interactiveLabel = true,
}: FieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const Wrapper = interactiveLabel ? 'label' : 'div';
  const control =
    isValidElement<ControlAttributes>(children) &&
    children.type !== Fragment &&
    (typeof children.type !== 'string' ||
      [
        'input',
        'textarea',
        'select',
        'button',
        'meter',
        'output',
        'progress',
      ].includes(children.type))
      ? children
      : null;
  const controlId = control?.props.id ?? `${id}-control`;
  const content = control
    ? cloneElement(control, {
        id: controlId,
        'aria-describedby':
          [control.props['aria-describedby'], hint && hintId, error && errorId]
            .filter(Boolean)
            .join(' ') || undefined,
        'aria-invalid': error ? true : control.props['aria-invalid'],
        ...(!interactiveLabel
          ? {
              'aria-labelledby': [control.props['aria-labelledby'], labelId]
                .filter(Boolean)
                .join(' '),
            }
          : {}),
      })
    : children;

  return (
    <div className={cn('ds-field', className)}>
      <Wrapper
        className="ds-field-wrapper"
        {...(interactiveLabel && control ? { htmlFor: controlId } : {})}
      >
        <span id={labelId} className="ds-field-label">
          {label}
        </span>
        <span className="ds-field-control">{content}</span>
      </Wrapper>
      {hint ? (
        <span id={hintId} className="ds-field-hint">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="ds-field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
