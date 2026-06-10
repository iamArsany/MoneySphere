import { clsx, type ClassValue } from 'clsx'
import type { HTMLAttributes } from 'react'

export function cn(...values: ClassValue[]) {
  return clsx(values)
}

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value))
}

export type SupportedLanguage = 'en' | 'ar'

export interface DirectionalProps {
  language?: SupportedLanguage
  dir?: HTMLAttributes<HTMLElement>['dir']
}

export function getDirection(language?: SupportedLanguage, dir?: HTMLAttributes<HTMLElement>['dir']) {
  return dir ?? (language === 'ar' ? 'rtl' : 'ltr')
}
