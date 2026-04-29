import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Play, TrendingUp, TrendingDown, AlertTriangle, Info, Loader2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'
import toast from 'react-hot-toast'
import { aiApi } from '@/lib/api'
import { formatCurrency, getRiskBg } from '@/lib/utils'
import type { SimulationResponse } from '@/types'
import RiskBadge from '@/components/ui/RiskBadge'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="arth-card !p-3 text-xs border-arth-dark-4 shadow-xl min-w-[180px]">
      <p className="text-muted-foreground font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium flex justify-between gap-4">
          <span>{p.name}</span>
          <span>{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function FinancialTwinPage() {
  const [months, setMonths] = useState(6)
  const [customIncome, setCustomIncome] = useState('')
  const [customExpense, setCustomExpense] = useState('')
  const [result, setResult] = useState<SimulationResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSimulate = async () => {
    setLoading(true)
    try {
      const scenario = (customIncome || customExpense) ? {
        ...(customIncome && { monthly_income: parseFloat(customIncome) }),
        ...(customExpense && { monthly_expense: parseFloat(customExpense) }),
      } : undefined
      const data = await aiApi.simulate(months, scenario)
      setResult(data)
      toast.success('Simulation complete!')
    } catch {
      toast.error('Simulation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const chartData = result?.snapshots.map(s => ({
    month: s.month.split(' ')[0].slice(0, 3),
    'Projected Balance': s.projected_balance,
    Income: s.projected_income,
    Expense: s.projected_expense,
    risk: s.risk_level,
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-arth-gold/10 flex items-center justify-center">
          <Brain size={24} className="text-arth-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">AI Financial Twin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Simulate your financial future before making decisions
          </p>
        </div>
      </div>

      {/* Config card */}
      <div className="arth-card">
        <h2 className="font-display text-lg font-semibold text-foreground mb-5">Configure Simulation</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Months to Simulate</label>
            <div className="flex gap-2 flex-wrap">
              {[3, 6, 12, 24].map(m => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    months === m
                      ? 'bg-arth-gold text-arth-dark'
                      : 'bg-arth-dark-3 text-muted-foreground hover:text-foreground border border-arth-dark-4'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Override Monthly Income <span className="text-arth-dark-4">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <input
                type="number"
                value={customIncome}
                onChange={e => setCustomIncome(e.target.value)}
                placeholder="Use my actual data"
                className="arth-input pl-7 text-sm"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Override Monthly Expense <span className="text-arth-dark-4">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <input
                type="number"
                value={customExpense}
                onChange={e => setCustomExpense(e.target.value)}
                placeholder="Use my actual data"
                className="arth-input pl-7 text-sm"
                min={0}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="arth-btn-primary flex items-center gap-2 px-8"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {loading ? 'Running Simulation…' : 'Run Simulation'}
          </button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info size={13} />
            Powered by Gemini AI + ML trend analysis
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* AI Summary */}
          <div className="arth-card border-arth-gold/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-arth-gold/15 flex items-center justify-center shrink-0">
                <Brain size={16} className="text-arth-gold" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-foreground">AI Financial Analysis</span>
                  <RiskBadge risk={result.overall_risk} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.ai_summary}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="arth-card">
              <h3 className="font-display text-base font-semibold text-foreground mb-5">Projected Balance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#22222F" />
                  <XAxis dataKey="month" tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Projected Balance" stroke="#C9A84C" strokeWidth={2.5}
                    fill="url(#balGrad)" dot={{ fill: '#C9A84C', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="arth-card">
              <h3 className="font-display text-base font-semibold text-foreground mb-5">Income vs Expense</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#22222F" />
                  <XAxis dataKey="month" tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#888' }} />
                  <Bar dataKey="Income" fill="#00E5A0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#FF4D6A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Month snapshots */}
          <div className="arth-card">
            <h3 className="font-display text-base font-semibold text-foreground mb-5">Month-by-Month Snapshots</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.snapshots.map((snap, i) => (
                <motion.div
                  key={snap.month}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-arth-dark-3 rounded-xl p-4 border border-arth-dark-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-foreground">{snap.month}</span>
                    <RiskBadge risk={snap.risk_level} />
                  </div>
                  <div className="font-display text-lg font-bold text-foreground mb-2">
                    {formatCurrency(snap.projected_balance)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Income</span>
                      <span className="text-arth-emerald">{formatCurrency(snap.projected_income)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Expense</span>
                      <span className="text-arth-rose">{formatCurrency(snap.projected_expense)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="text-arth-gold">{(snap.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="arth-card">
            <h3 className="font-display text-base font-semibold text-foreground mb-4">
              AI Recommendations
            </h3>
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-arth-dark-3 rounded-xl"
                >
                  <div className="w-5 h-5 rounded-full bg-arth-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-arth-gold text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rec}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!result && !loading && (
        <div className="arth-card text-center py-16">
          <Brain size={48} className="text-arth-gold/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Your financial future awaits
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Configure your simulation parameters above and click Run to see AI-powered projections.
          </p>
        </div>
      )}
    </div>
  )
}
