import type { HTMLAttributes, ReactNode } from 'react'
import { cn, clampPercent, getDirection, type DirectionalProps } from './utils'

export type ChartTone = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'neutral'

export const CHART_TEXT = {
  empty: 'No chart data available.',
} as const

export interface BarChartDatum {
  id: string
  label: string
  value: number
  tone?: ChartTone
}

export interface DonutChartSegment {
  id: string
  label: string
  value: number
  tone?: ChartTone
}

export interface BarChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'dir'>, DirectionalProps {
  data: BarChartDatum[]
  title?: ReactNode
  emptyMessage?: string
  formatValue?: (value: number) => ReactNode
}

export interface DonutChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'dir'>, DirectionalProps {
  segments: DonutChartSegment[]
  title?: ReactNode
  centerLabel?: ReactNode
  emptyMessage?: string
  formatValue?: (value: number) => ReactNode
}

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  tone?: ChartTone
  label?: ReactNode
}

const toneClasses: Record<ChartTone, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary-container',
  tertiary: 'bg-tertiary',
  danger: 'bg-error',
  neutral: 'bg-outline',
}

const strokeClasses: Record<ChartTone, string> = {
  primary: 'stroke-primary',
  secondary: 'stroke-secondary-container',
  tertiary: 'stroke-tertiary',
  danger: 'stroke-error',
  neutral: 'stroke-outline',
}

const textClasses: Record<ChartTone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  danger: 'text-error',
  neutral: 'text-outline',
}

export function BarChart({
  data,
  title,
  emptyMessage = CHART_TEXT.empty,
  formatValue,
  className,
  language,
  dir,
  ...props
}: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 0)

  return (
    <section
      className={cn('rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-md shadow-sm sm:p-lg', className)}
      dir={getDirection(language, dir)}
      {...props}
    >
      {title ? <h3 className="mb-md font-title-lg text-title-lg text-on-surface">{title}</h3> : null}
      {data.length > 0 ? (
        <>
          <div className="flex h-56 items-end gap-sm border-b border-outline-variant/60 px-xs pb-xs">
            {data.map((item) => (
              <div key={item.id} className="flex h-full min-w-0 flex-1 items-end">
                <div
                  className={cn('w-full rounded-t transition-opacity hover:opacity-80', heightClass(maxValue > 0 ? (item.value / maxValue) * 100 : 0), toneClasses[item.tone ?? 'primary'])}
                  title={`${item.label}: ${formatPlainValue(item.value, formatValue)}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-xs flex justify-between gap-xs px-xs font-label-md text-label-md font-semibold text-on-surface-variant">
            {data.map((item) => (
              <span key={item.id} className="truncate">
                {item.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <ChartEmpty message={emptyMessage} />
      )}
    </section>
  )
}

export function DonutChart({
  segments,
  title,
  centerLabel,
  emptyMessage = CHART_TEXT.empty,
  formatValue,
  className,
  language,
  dir,
  ...props
}: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0)
  let offset = 0

  return (
    <section
      className={cn('rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-md shadow-sm sm:p-lg', className)}
      dir={getDirection(language, dir)}
      {...props}
    >
      {title ? <h3 className="mb-md font-title-lg text-title-lg text-on-surface">{title}</h3> : null}
      {segments.length > 0 && total > 0 ? (
        <>
          <div className="flex justify-center">
            <div className="relative h-36 w-36">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" role="img" aria-hidden={centerLabel ? 'true' : undefined}>
                <circle className="fill-transparent stroke-surface-variant" cx="60" cy="60" r="48" strokeWidth="14" />
                {segments.map((segment) => {
                  const percent = (Math.max(segment.value, 0) / total) * 100
                  const dashOffset = -offset
                  offset += percent

                  return (
                    <circle
                      key={segment.id}
                      className={cn('fill-transparent transition-opacity hover:opacity-80', strokeClasses[segment.tone ?? 'primary'])}
                      cx="60"
                      cy="60"
                      r="48"
                      pathLength="100"
                      strokeDasharray={`${percent} ${100 - percent}`}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      strokeWidth="14"
                    />
                  )
                })}
              </svg>
              {centerLabel ? (
                <span className="absolute inset-0 flex items-center justify-center text-center font-title-lg text-title-lg text-on-surface">
                  {centerLabel}
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-lg space-y-sm">
            {segments.map((segment) => (
              <div key={segment.id} className="flex items-center justify-between gap-sm font-body-sm text-body-sm">
                <span className="flex min-w-0 items-center gap-xs">
                  <span className={cn('h-3 w-3 shrink-0 rounded-full', toneClasses[segment.tone ?? 'primary'])} />
                  <span className="truncate text-on-surface">{segment.label}</span>
                </span>
                <span className={cn('font-semibold', textClasses[segment.tone ?? 'primary'])}>
                  {formatValue ? formatValue(segment.value) : segment.value}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <ChartEmpty message={emptyMessage} />
      )}
    </section>
  )
}

export function ProgressBar({ value, tone = 'primary', label, className, ...props }: ProgressBarProps) {
  return (
    <div className={cn('space-y-xs', className)} {...props}>
      {label ? <div className="font-label-md text-label-md font-semibold uppercase text-on-surface-variant">{label}</div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-surface-variant">
        <div className={cn('h-full rounded-full', widthClass(value), toneClasses[tone])} />
      </div>
    </div>
  )
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-outline-variant p-md text-center font-body-sm text-body-sm text-on-surface-variant">
      {message}
    </div>
  )
}

function heightClass(value: number) {
  const percent = clampPercent(value)
  if (percent <= 10) return 'h-[10%]'
  if (percent <= 20) return 'h-1/5'
  if (percent <= 30) return 'h-[30%]'
  if (percent <= 40) return 'h-2/5'
  if (percent <= 50) return 'h-1/2'
  if (percent <= 60) return 'h-3/5'
  if (percent <= 70) return 'h-[70%]'
  if (percent <= 80) return 'h-4/5'
  if (percent <= 90) return 'h-[90%]'
  return 'h-full'
}

function widthClass(value: number) {
  const percent = clampPercent(value)
  if (percent <= 10) return 'w-[10%]'
  if (percent <= 20) return 'w-1/5'
  if (percent <= 30) return 'w-[30%]'
  if (percent <= 40) return 'w-2/5'
  if (percent <= 50) return 'w-1/2'
  if (percent <= 60) return 'w-3/5'
  if (percent <= 70) return 'w-[70%]'
  if (percent <= 80) return 'w-4/5'
  if (percent <= 90) return 'w-[90%]'
  return 'w-full'
}

function formatPlainValue(value: number, formatter?: (value: number) => ReactNode) {
  const formatted = formatter?.(value)
  return typeof formatted === 'string' || typeof formatted === 'number' ? formatted : value
}
