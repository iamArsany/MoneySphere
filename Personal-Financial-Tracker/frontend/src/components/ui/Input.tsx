import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn, getDirection, type DirectionalProps } from './utils'

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement>, DirectionalProps {
  label?: string
  helperText?: string
  errorText?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, DirectionalProps {
  label?: string
  helperText?: string
  errorText?: string
}

export function TextInput({
  id,
  label,
  helperText,
  errorText,
  leadingIcon,
  trailingIcon,
  className,
  language,
  dir,
  ...props
}: TextInputProps) {
  const describedBy = errorText ? `${id}-error` : helperText ? `${id}-helper` : undefined

  return (
    <label className="flex flex-col gap-xs" dir={getDirection(language, dir)} htmlFor={id}>
      {label ? <span className="font-label-md text-label-md font-semibold uppercase text-on-surface-variant">{label}</span> : null}
      <span className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute start-sm top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-outline">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={errorText ? true : undefined}
          className={cn(
            'w-full rounded-lg border bg-surface-container-lowest py-sm font-body-base text-body-base text-on-surface outline-none transition placeholder:text-outline focus:ring-1 disabled:cursor-not-allowed disabled:bg-surface-variant disabled:text-on-surface-variant',
            leadingIcon ? 'ps-11' : 'ps-md',
            trailingIcon ? 'pe-11' : 'pe-md',
            errorText
              ? 'border-error focus:border-error focus:ring-error'
              : 'border-outline-variant focus:border-primary focus:ring-primary',
            className,
          )}
          {...props}
        />
        {trailingIcon ? (
          <span className="absolute end-sm top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-outline">
            {trailingIcon}
          </span>
        ) : null}
      </span>
      {errorText ? (
        <span id={`${id}-error`} className="font-body-sm text-body-sm text-error">
          {errorText}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} className="font-body-sm text-body-sm text-on-surface-variant">
          {helperText}
        </span>
      ) : null}
    </label>
  )
}

export function TextArea({
  id,
  label,
  helperText,
  errorText,
  className,
  language,
  dir,
  ...props
}: TextAreaProps) {
  const describedBy = errorText ? `${id}-error` : helperText ? `${id}-helper` : undefined

  return (
    <label className="flex flex-col gap-xs" dir={getDirection(language, dir)} htmlFor={id}>
      {label ? <span className="font-label-md text-label-md font-semibold uppercase text-on-surface-variant">{label}</span> : null}
      <textarea
        id={id}
        aria-describedby={describedBy}
        aria-invalid={errorText ? true : undefined}
        className={cn(
          'min-h-28 resize-y rounded-lg border bg-surface-container-lowest p-sm font-body-base text-body-base text-on-surface outline-none transition placeholder:text-outline focus:ring-1 disabled:cursor-not-allowed disabled:bg-surface-variant disabled:text-on-surface-variant',
          errorText
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-outline-variant focus:border-primary focus:ring-primary',
          className,
        )}
        {...props}
      />
      {errorText ? (
        <span id={`${id}-error`} className="font-body-sm text-body-sm text-error">
          {errorText}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} className="font-body-sm text-body-sm text-on-surface-variant">
          {helperText}
        </span>
      ) : null}
    </label>
  )
}
