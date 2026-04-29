import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  accentColor?: string
  className?: string
}

export default function StatCard({
  title, value, subtitle, icon: Icon, trend, trendValue, accentColor = '#C9A84C', className
}: StatCardProps) {
  return (
    <div className={cn('arth-card group hover:border-arth-dark-4/80 transition-all duration-300', className)}>
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accentColor}18` }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>
        {trend && trendValue && (
          <span className={cn('stat-chip', trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral')}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
      <div className="font-display text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground/60 mt-1">{subtitle}</div>}
    </div>
  )
}
