import { cn, getRiskBg } from '@/lib/utils'

export default function RiskBadge({ risk, className }: { risk: string; className?: string }) {
  return (
    <span className={cn('stat-chip capitalize', getRiskBg(risk), className)}>
      {risk}
    </span>
  )
}
