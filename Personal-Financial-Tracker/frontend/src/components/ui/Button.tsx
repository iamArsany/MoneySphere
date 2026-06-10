import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn, getDirection, type DirectionalProps } from './utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, DirectionalProps {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  isFullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-on-primary-fixed-variant focus:ring-primary disabled:bg-surface-variant disabled:text-on-surface-variant/50',
  secondary:
    'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim focus:ring-secondary disabled:bg-surface-variant disabled:text-on-surface-variant/50',
  outline:
    'border border-primary bg-transparent text-primary hover:bg-primary-container/20 focus:ring-primary disabled:border-outline-variant disabled:text-on-surface-variant/50',
  ghost:
    'bg-transparent text-primary hover:bg-primary-container/20 focus:ring-primary disabled:text-on-surface-variant/50',
  danger:
    'bg-error text-on-error hover:bg-error/90 focus:ring-error disabled:bg-surface-variant disabled:text-on-surface-variant/50',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-sm py-xs text-label-md',
  md: 'px-md py-sm text-label-md',
  lg: 'px-lg py-sm text-body-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  isFullWidth = false,
  className,
  children,
  language,
  dir,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      dir={getDirection(language, dir)}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-xs rounded-lg font-label-md font-semibold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        isFullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  )
}

export default Button
