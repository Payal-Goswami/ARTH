import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Spinner({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 size={size} className="animate-spin text-arth-gold" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Spinner size={32} />
      <p className="text-muted-foreground text-sm animate-pulse">Loading intelligence…</p>
    </div>
  )
}
