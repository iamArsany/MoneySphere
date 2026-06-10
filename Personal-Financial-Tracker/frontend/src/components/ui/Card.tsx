import type { HTMLAttributes, ReactNode } from 'react'
import { cn, getDirection, type DirectionalProps } from './utils'

export interface CardProps extends HTMLAttributes<HTMLElement>, DirectionalProps {
  children: ReactNode
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  const { language, dir, ...sectionProps } = props

  return (
    <section
      dir={getDirection(language, dir)}
      className={cn('rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm', className)}
      {...sectionProps}
    >
      {children}
    </section>
  )
}

export function CardHeader({
  title,
  subtitle,
  actions,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-sm border-b border-outline-variant/60 bg-surface p-md sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      {...props}
    >
      <div>
        {title ? <h2 className="font-title-lg text-title-lg text-on-surface">{title}</h2> : null}
        {subtitle ? <p className="mt-base font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-xs">{actions}</div> : null}
    </div>
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-md sm:p-lg', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-t border-outline-variant/60 bg-surface p-md sm:p-lg', className)}
      {...props}
    />
  )
}
