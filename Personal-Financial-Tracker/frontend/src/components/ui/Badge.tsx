import type { HTMLAttributes, ReactNode } from 'react'
import { cn, getDirection, type DirectionalProps } from './utils'

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, DirectionalProps {
  tone?: BadgeTone
  withDot?: boolean
  children: ReactNode
}

const badgeClasses: Record<BadgeTone, string> = {
  primary: 'bg-primary-container/30 text-primary',
  success: 'bg-tertiary-container/30 text-tertiary',
  warning: 'bg-secondary-container/30 text-secondary',
  danger: 'bg-error-container/50 text-error',
  neutral: 'bg-surface-variant text-on-surface-variant',
}

const dotClasses: Record<BadgeTone, string> = {
  primary: 'bg-primary',
  success: 'bg-tertiary',
  warning: 'bg-secondary',
  danger: 'bg-error',
  neutral: 'bg-outline',
}

export function Badge({ tone = 'primary', withDot = false, className, children, language, dir, ...props }: BadgeProps) {
  return (
    <span
      dir={getDirection(language, dir)}
      className={cn(
        'inline-flex items-center gap-base rounded-full px-sm py-1 font-label-md text-label-md uppercase',
        badgeClasses[tone],
        className,
      )}
      {...props}
    >
      {withDot ? <span className={cn('h-2 w-2 rounded-full', dotClasses[tone])} /> : null}
      {children}
    </span>
  )
}

export default Badge
