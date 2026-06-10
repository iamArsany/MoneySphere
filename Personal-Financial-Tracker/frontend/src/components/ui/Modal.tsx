import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cn, getDirection, type DirectionalProps } from './utils'

export const MODAL_TEXT = {
  close: 'Close',
} as const

export interface ModalProps extends DirectionalProps {
  isOpen: boolean
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  closeLabel?: string
  className?: string
  onClose: () => void
}

export function Modal({
  isOpen,
  title,
  description,
  children,
  footer,
  closeLabel = MODAL_TEXT.close,
  className,
  language,
  dir,
  onClose,
}: ModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/50 p-md backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      dir={getDirection(language, dir)}
    >
      <section className={cn('flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl', className)}>
        <header className="flex items-start justify-between gap-md border-b border-outline-variant p-md sm:p-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
            {description ? <p className="mt-base font-body-sm text-body-sm text-on-surface-variant">{description}</p> : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label={closeLabel}
            onClick={onClose}
            language={language}
            className="h-10 w-10 rounded-full p-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </header>
        {children ? <div className="overflow-y-auto p-md sm:p-lg">{children}</div> : null}
        {footer ? (
          <footer className="flex flex-col-reverse gap-sm border-t border-outline-variant bg-surface p-md sm:flex-row sm:justify-end sm:p-lg">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  )
}

export default Modal
