import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, Shield, Loader2, Activity, Keyboard, MousePointer, Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { aiApi } from '@/lib/api'
import type { FraudCheckResponse } from '@/types'
import { getRiskBg } from '@/lib/utils'
import RiskBadge from '@/components/ui/RiskBadge'

export default function FraudPage() {
  const [result, setResult] = useState<FraudCheckResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [collecting, setCollecting] = useState(false)

  // Behavioral biometric collection
  const keystrokeTimes = useRef<number[]>([])
  const mouseMoves = useRef<number[]>([])
  const lastKeyTime = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const now = Date.now()
    if (lastKeyTime.current > 0) {
      keystrokeTimes.current.push(now - lastKeyTime.current)
    }
    lastKeyTime.current = now
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseMoves.current.length < 50) {
      mouseMoves.current.push(e.movementX + e.movementY)
    }
  }

  const startCollection = () => {
    setCollecting(true)
    keystrokeTimes.current = []
    mouseMoves.current = []
    lastKeyTime.current = 0
    toast('Type naturally in the box below to collect behavioral data', { icon: '🎯' })
  }

  const runFraudCheck = async () => {
    setLoading(true)
    try {
      const data = await aiApi.fraudCheck({
        session_id: `session_${Date.now()}`,
        device_fingerprint: navigator.userAgent.slice(0, 50),
        location: Intl.DateTimeFormat().resolvedOptions().timeZone,
        typing_pattern: keystrokeTimes.current.slice(0, 30),
        mouse_pattern: mouseMoves.current.slice(0, 20),
      })
      setResult(data)
      setCollecting(false)
      if (data.is_anomalous) {
        toast.error('⚠ Behavioral anomaly detected!', { duration: 5000 })
      } else {
        toast.success('Identity verified — no anomalies detected')
      }
    } catch {
      toast.error('Fraud check failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const riskColor = result?.risk_level === 'low' ? '#00E5A0'
    : result?.risk_level === 'medium' ? '#FFB830'
    : result?.risk_level === 'high' ? '#FF7A30'
    : '#FF4D6A'

  return (
    <div className="space-y-6" onMouseMove={collecting ? handleMouseMove : undefined}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-arth-emerald/10 flex items-center justify-center">
          <ShieldAlert size={24} className="text-arth-emerald" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Behavioral Fraud Shield</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Continuous identity authentication through behavioral biometrics
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Keyboard, label: 'Keystroke Dynamics', desc: 'Typing rhythm & inter-key timing', color: '#C9A84C' },
          { icon: MousePointer, label: 'Mouse Behaviour', desc: 'Movement speed & patterns', color: '#00D4FF' },
          { icon: Smartphone, label: 'Device Fingerprint', desc: 'Browser & device context', color: '#00E5A0' },
        ].map(item => (
          <div key={item.label} className="arth-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.color}18` }}>
              <item.icon size={17} style={{ color: item.color }} />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Collection area */}
      <div className="arth-card">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Behavioral Data Collection</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Click "Start Collection" then type naturally in the box below. The AI learns your unique typing rhythm to verify your identity.
        </p>

        <div className="bg-arth-dark-3 rounded-xl p-4 mb-5 border border-arth-dark-4">
          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
            <Activity size={12} />
            Type this sentence naturally:
          </div>
          <p className="text-sm text-arth-gold font-mono mb-3">
            "ARTH helps me predict, explain, and protect my finances every day."
          </p>
          <input
            ref={inputRef}
            type="text"
            onKeyDown={collecting ? handleKeyDown : undefined}
            className="arth-input font-mono text-sm"
            placeholder={collecting ? 'Start typing above sentence…' : 'Click "Start Collection" first'}
            disabled={!collecting}
          />
          {collecting && (
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-arth-emerald animate-pulse" />
                Collecting keystrokes: {keystrokeTimes.current.length}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-arth-cyan animate-pulse" />
                Mouse samples: {mouseMoves.current.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!collecting ? (
            <button onClick={startCollection} className="arth-btn-primary flex items-center gap-2">
              <Activity size={16} />
              Start Collection
            </button>
          ) : (
            <button
              onClick={runFraudCheck}
              disabled={loading || keystrokeTimes.current.length < 3}
              className="arth-btn-primary flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {loading ? 'Analyzing…' : 'Run Fraud Check'}
            </button>
          )}
          {collecting && (
            <button onClick={() => setCollecting(false)} className="arth-btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Risk gauge */}
          <div className="arth-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Analysis Result</h2>
              <RiskBadge risk={result.risk_level} />
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div
                className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4"
                style={{ borderColor: riskColor, boxShadow: `0 0 20px ${riskColor}40` }}
              >
                {result.is_anomalous
                  ? <AlertTriangle size={28} style={{ color: riskColor }} />
                  : <CheckCircle2 size={28} style={{ color: riskColor }} />
                }
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-foreground mb-1">
                  {result.is_anomalous ? 'Anomaly Detected' : 'Identity Verified'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Anomaly Score: <span className="font-mono font-bold" style={{ color: riskColor }}>
                    {(result.anomaly_score * 100).toFixed(1)}%
                  </span>
                </div>
                {result.flagged_reason && (
                  <div className="text-sm text-arth-rose mt-1">⚠ {result.flagged_reason}</div>
                )}
              </div>
            </div>

            {/* Anomaly bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Normal</span>
                <span>Anomalous</span>
              </div>
              <div className="h-2.5 bg-arth-dark-4 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.anomaly_score * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, #00E5A0, ${riskColor})`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="arth-card">
            <h3 className="font-display text-base font-semibold text-foreground mb-4">Security Recommendations</h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <Shield size={14} className="text-arth-emerald mt-0.5 shrink-0" />
                  {rec}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {!result && !loading && !collecting && (
        <div className="arth-card text-center py-12">
          <Shield size={48} className="text-arth-emerald/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Security that knows you
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Our behavioral AI creates a unique fingerprint of how you interact — not just what you do, but how you do it.
          </p>
        </div>
      )}
    </div>
  )
}
