import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn, getDirection, type DirectionalProps } from './utils'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement>, DirectionalProps {
  minWidthClassName?: string
}

export function Table({ className, minWidthClassName = 'min-w-[760px]', language, dir, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto" dir={getDirection(language, dir)}>
      <table
        className={cn('w-full border-collapse text-start', minWidthClassName, className)}
        {...props}
      />
    </div>
  )
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-surface-container-low/70', className)} {...props} />
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-outline-variant/50', className)} {...props} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors hover:bg-surface-container-low/50', className)} {...props} />
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('border-b border-outline-variant px-md py-sm text-start font-label-md text-label-md font-semibold uppercase text-on-surface-variant', className)}
      scope="col"
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-md py-md font-body-sm text-body-sm text-on-surface-variant', className)} {...props} />
}
