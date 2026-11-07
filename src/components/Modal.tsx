import type { ReactNode } from 'react';
import {
  Dialog,
  Heading,
  Modal as AriaModal,
  ModalOverlay,
} from 'react-aria-components';
import { cn } from '../lib/cn';

export type ModalProps = {
  open: boolean;
  title: string;
  busy?: boolean;
  onClose: () => void;
  className?: string;
  bodyClassName?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function Modal({
  open,
  title,
  busy = false,
  onClose,
  className,
  bodyClassName,
  footer,
  children,
}: ModalProps) {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !busy) onClose();
      }}
      isDismissable={!busy}
      className="ds-modal-overlay"
    >
      <AriaModal
        className={cn('ds-modal', footer && 'ds-modal--with-footer', className)}
      >
        <Dialog className="ds-modal-dialog" aria-label={title}>
          <div className="ds-modal-header">
            <Heading slot="title" className="ds-modal-title">
              {title}
            </Heading>
            <button
              type="button"
              aria-label="Close"
              disabled={busy}
              onClick={onClose}
              className="ds-modal-close"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m6 6 12 12M6 18 18 6" />
              </svg>
            </button>
          </div>
          <div className={cn('ds-modal-body', bodyClassName)}>{children}</div>
          {footer ? <div className="ds-modal-footer">{footer}</div> : null}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}
