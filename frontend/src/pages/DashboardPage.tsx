import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Brain, CreditCard, ShieldAlert, ArrowRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '@/components/ui/StatCard'
import { PageLoader } from '@/components/ui/Spinner'
import { txApi } from '@/lib/api'
import { formatCurrency, formatRelativeDate, getCategoryIcon } from '@/lib/utils'
import type { TransactionSummary, Transaction } from '@/types'
import { useAuthStore } from '@/store/authStore'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="arth-card !p-3 text-xs border-arth-dark-4 shadow-xl">
      <p className="text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [recentTx, setRecentTx] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [sum, txs] = await Promise.all([txApi.summary(), txApi.list(5)])
        setSummary(sum)
        setRecentTx(txs)
      } catch (e) {
        // Will show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const chartData = summary?.monthly_trend.map(m => ({
    month: m.month.slice(5),
    Income: m.income,
    Expense: m.expense,
  })) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">
          Financial Overview
        </h1>
        <p className="text-muted-foreground">
          Your AI-powered financial intelligence dashboard
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(summary?.total_income || 0)}
          icon={TrendingUp}
          accentColor="#00E5A0"
          trend="up"
          trendValue="This period"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.total_expense || 0)}
          icon={TrendingDown}
          accentColor="#FF4D6A"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(summary?.net_savings || 0)}
          icon={Wallet}
          accentColor="#C9A84C"
          trend={(summary?.net_savings || 0) >= 0 ? 'up' : 'down'}
          trendValue={(summary?.net_savings || 0) >= 0 ? 'Positive' : 'Negative'}
        />
        <StatCard
          title="Flagged Transactions"
          value={String(summary?.flagged_count || 0)}
          icon={AlertTriangle}
          accentColor="#FFB830"
          subtitle="Potential fraud alerts"
        />
      </div>

      {/* Chart + Categories */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 arth-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Cash Flow Trend</h2>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00E5A0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4D6A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF4D6A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#22222F" />
                <XAxis dataKey="month" tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Income" stroke="#00E5A0" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="Expense" stroke="#FF4D6A" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
              No transaction data yet. <Link to="/dashboard/transactions" className="text-arth-gold ml-1 hover:underline">Add transactions</Link>
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="arth-card">
          <h2 className="font-display text-lg font-semibold text-foreground mb-5">Top Spending</h2>
          {(summary?.top_categories.length || 0) > 0 ? (
            <div className="space-y-4">
              {summary!.top_categories.map((cat, i) => {
                const pct = summary!.total_expense > 0
                  ? (cat.amount / summary!.total_expense) * 100
                  : 0
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-foreground capitalize flex items-center gap-2">
                        <span>{getCategoryIcon(cat.category)}</span>
                        {cat.category}
                      </span>
                      <span className="text-muted-foreground">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-1.5 bg-arth-dark-4 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C97A)' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No expense data yet.</p>
          )}
        </div>
      </div>

      {/* Quick actions + Recent transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick AI actions */}
        <div className="arth-card">
          <h2 className="font-display text-lg font-semibold text-foreground mb-5">AI Intelligence</h2>
          <div className="space-y-3">
            {[
              { icon: Brain, label: 'Simulate Future Finances', to: '/dashboard/twin', color: '#C9A84C', desc: 'See projections for next 6 months' },
              { icon: CreditCard, label: 'Check Credit Score', to: '/dashboard/credit', color: '#00D4FF', desc: 'XAI-powered credit analysis' },
              { icon: ShieldAlert, label: 'Fraud Risk Check', to: '/dashboard/fraud', color: '#00E5A0', desc: 'Behavioral anomaly detection' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-4 p-3 rounded-xl border border-arth-dark-4 hover:border-arth-gold/30 transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.color}18` }}>
                  <item.icon size={17} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
                <ArrowRight size={15} className="text-muted-foreground group-hover:text-arth-gold transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="arth-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Link to="/dashboard/transactions" className="text-xs text-arth-gold hover:text-arth-gold-light transition-colors">
              View all →
            </Link>
          </div>
          {recentTx.length > 0 ? (
            <div className="space-y-3">
              {recentTx.map(tx => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-arth-dark-3 flex items-center justify-center text-sm">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">{tx.merchant || tx.description || tx.category}</div>
                    <div className="text-xs text-muted-foreground">{formatRelativeDate(tx.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${tx.type === 'income' ? 'text-arth-emerald' : 'text-arth-rose'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    {tx.is_flagged && (
                      <div className="text-xs text-arth-amber">⚠ Flagged</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No transactions yet. <Link to="/dashboard/transactions" className="text-arth-gold hover:underline">Add one</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
