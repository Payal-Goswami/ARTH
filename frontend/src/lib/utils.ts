import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(dateString)
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low': return 'text-arth-emerald'
    case 'moderate': return 'text-arth-amber'
    case 'high': return 'text-orange-400'
    case 'critical': return 'text-arth-rose'
    default: return 'text-muted-foreground'
  }
}

export function getRiskBg(risk: string): string {
  switch (risk) {
    case 'low': return 'bg-emerald-950/60 text-arth-emerald'
    case 'moderate': return 'bg-amber-950/60 text-arth-amber'
    case 'high': return 'bg-orange-950/60 text-orange-400'
    case 'critical': return 'bg-rose-950/60 text-arth-rose'
    default: return 'bg-arth-dark-3 text-muted-foreground'
  }
}

export function getCreditGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#00E5A0'
  if (grade.startsWith('B')) return '#C9A84C'
  if (grade.startsWith('C')) return '#FFB830'
  return '#FF4D6A'
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    food: '🍽️', transport: '🚗', entertainment: '🎬',
    utilities: '⚡', healthcare: '💊', education: '📚',
    shopping: '🛍️', rent: '🏠', salary: '💰',
    investment: '📈', other: '📦',
  }
  return icons[category] || '📦'
}
