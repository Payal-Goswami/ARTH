import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, RefreshCw, Loader2, TrendingUp, Info, Zap } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import toast from 'react-hot-toast'
import { aiApi } from '@/lib/api'
import type { CreditScoreResponse } from '@/types'
import { getCreditGradeColor } from '@/lib/utils'

const FACTOR_LABELS: Record<string, string> = {
  payment_history: 'Payment History',
  utilization: 'Credit Utilization',
  age_of_credit: 'Age of Credit',
  credit_mix: 'Credit Mix',
  new_credit: 'New Credit',
}

const FACTOR_WEIGHTS: Record<string, number> = {
  payment_history: 35,
  utilization: 30,
  age_of_credit: 15,
  credit_mix: 10,
  new_credit: 10,
}

export default function CreditPage() {
  const [data, setData] = useState<CreditScoreResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchScore = async () => {
    setLoading(true)
    try {
      const result = await aiApi.creditScore()
      setData(result)
      toast.success('Credit score computed!')
    } catch {
      toast.error('Failed to compute credit score. Add more transactions first.')
    } finally {
      setLoading(false)
    }
  }

  const gradeColor = data ? getCreditGradeColor(data.grade) : '#C9A84C'
  const scorePercent = data ? ((data.score - 300) / 600) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <CreditCard size={24} className="text-arth-cyan" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Explainable Credit Score</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Beyond CIBIL — transparent scoring with actionable improvement plans
            </p>
          </div>
        </div>
        <button
          onClick={fetchScore}
          disabled={loading}
          className="arth-btn-primary flex items-center gap-2"
        >
          {loading
            ? <Loader2 size={16} className="animate-spin" />
            : <RefreshCw size={16} />
          }
          {loading ? 'Computing…' : data ? 'Recompute' : 'Compute Score'}
        </button>
      </div>

      {!data && !loading && (
        <div className="arth-card text-center py-16">
          <CreditCard size={48} className="text-arth-cyan/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Get your AI credit score
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Our XAI engine analyses your transactions and gives you a transparent, explainable credit score.
          </p>
          <button onClick={fetchScore} className="arth-btn-primary">Compute My Score</button>
        </div>
      )}

      {loading && (
        <div className="arth-card text-center py-16">
          <Loader2 size={40} className="text-arth-cyan animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground animate-pulse">Analysing your financial behaviour…</p>
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Score hero */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="arth-card flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-48 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="75%"
                    outerRadius="100%"
                    data={[{ value: scorePercent, fill: gradeColor }]}
                    startAngle={180}
                    endAngle={-180}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#1A1A24' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-4xl font-bold" style={{ color: gradeColor }}>
                    {data.score.toFixed(0)}
                  </span>
                  <span className="text-muted-foreground text-xs mt-1">out of 900</span>
                </div>
              </div>
              <div
                className="text-3xl font-display font-bold mb-1"
                style={{ color: gradeColor }}
              >
                Grade {data.grade}
              </div>
              <p className="text-xs text-muted-foreground">
                Computed {new Date(data.computed_at).toLocaleDateString('en-IN')}
              </p>
            </div>

            {/* AI Explanation */}
            <div className="lg:col-span-2 arth-card">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-arth-cyan" />
                <span className="text-sm font-semibold text-foreground">AI Explanation</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{data.ai_explanation}</p>

              {/* Factor breakdown */}
              <div className="space-y-3">
                {Object.entries(data.factors).map(([key, value]) => {
                  const pct = (value / 900) * 100
                  const label = FACTOR_LABELS[key] || key
                  const weight = FACTOR_WEIGHTS[key] || 0
                  const color = pct > 70 ? '#00E5A0' : pct > 40 ? '#C9A84C' : '#FF4D6A'
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-foreground">{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Weight: {weight}%</span>
                          <span className="font-medium" style={{ color }}>{value.toFixed(0)}/900</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-arth-dark-4 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Reasons + Improvements */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="arth-card">
              <h3 className="font-display text-base font-semibold text-foreground mb-4">Why this score?</h3>
              <ul className="space-y-3">
                {data.reasons.map((reason, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="w-5 h-5 rounded-full bg-arth-rose/20 text-arth-rose flex items-center justify-center text-xs shrink-0 mt-0.5">!</span>
                    {reason}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="arth-card">
              <h3 className="font-display text-base font-semibold text-foreground mb-4">
                <span className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-arth-emerald" />
                  How to improve
                </span>
              </h3>
              <ul className="space-y-3">
                {data.improvements.map((imp, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="w-5 h-5 rounded-full bg-arth-emerald/20 text-arth-emerald flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                    {imp}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* What-if scenarios */}
          {Object.keys(data.what_if_scenarios).length > 0 && (
            <div className="arth-card">
              <div className="flex items-center gap-2 mb-5">
                <Info size={16} className="text-arth-amber" />
                <h3 className="font-display text-base font-semibold text-foreground">What-If Scenarios</h3>
                <span className="text-xs text-muted-foreground ml-1">Estimated score improvements</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(data.what_if_scenarios).map(([key, points]) => (
                  <div key={key} className="bg-arth-dark-3 rounded-xl p-4 text-center border border-arth-dark-4">
                    <div className="font-display text-2xl font-bold text-arth-emerald mb-1">
                      +{points}
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {key.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
