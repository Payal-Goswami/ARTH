import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { txApi } from '@/lib/api'
import { formatCurrency, formatRelativeDate, getCategoryIcon } from '@/lib/utils'
import type { Transaction, TransactionCreate } from '@/types'
import { PageLoader } from '@/components/ui/Spinner'

const CATEGORIES = ['food','transport','entertainment','utilities','healthcare','education','shopping','rent','salary','investment','other']
const TYPES = ['income','expense','transfer','investment']

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<Partial<TransactionCreate>>({
    type: 'expense',
    category: 'food',
    is_recurring: false,
  })

  const loadTx = async () => {
    try {
      const data = await txApi.list(100)
      setTransactions(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTx() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || !form.type || !form.category) {
      toast.error('Fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const tx = await txApi.create(form as TransactionCreate)
      setTransactions(prev => [tx, ...prev])
      setShowForm(false)
      setForm({ type: 'expense', category: 'food', is_recurring: false })
      if (tx.is_flagged) {
        toast.error('⚠ Transaction flagged as suspicious by fraud AI', { duration: 5000 })
      } else {
        toast.success('Transaction added')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add transaction')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">Every transaction is scanned by fraud AI in real-time</p>
        </div>
        <button onClick={() => setShowForm(true)} className="arth-btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="arth-card w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">New Transaction</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Type *</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value as any })}
                      className="arth-input capitalize"
                    >
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Amount (₹) *</label>
                    <input
                      type="number"
                      value={form.amount || ''}
                      onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })}
                      placeholder="0"
                      className="arth-input"
                      min={0}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="arth-input capitalize"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Merchant / Description</label>
                  <input
                    value={form.merchant || ''}
                    onChange={e => setForm({ ...form, merchant: e.target.value })}
                    placeholder="Swiggy, Amazon, etc."
                    className="arth-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
                    <input
                      value={form.location || ''}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder="Mumbai, Delhi…"
                      className="arth-input"
                    />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_recurring}
                        onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                        className="w-4 h-4 rounded accent-arth-gold"
                      />
                      <span className="text-sm text-muted-foreground">Recurring</span>
                    </label>
                  </div>
                </div>

                <div className="bg-arth-dark-3 rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <AlertTriangle size={13} className="text-arth-amber mt-0.5 shrink-0" />
                  Fraud AI will analyze this transaction in real-time and flag suspicious activity.
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="arth-btn-ghost flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="arth-btn-primary flex-1">
                    {submitting ? 'Analyzing…' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction list */}
      <div className="arth-card">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-arth-dark-4">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="w-10 h-10 rounded-xl bg-arth-dark-3 flex items-center justify-center text-lg">
                  {getCategoryIcon(tx.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {tx.merchant || tx.description || tx.category}
                    </span>
                    {tx.is_flagged && (
                      <span className="stat-chip negative text-xs">⚠ Flagged</span>
                    )}
                    {tx.is_recurring && (
                      <span className="stat-chip neutral text-xs">🔄 Recurring</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span className="capitalize">{tx.category}</span>
                    {tx.location && <><span>·</span><span>{tx.location}</span></>}
                    <span>·</span>
                    <span>{formatRelativeDate(tx.created_at)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${tx.type === 'income' ? 'text-arth-emerald' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{tx.type}</div>
                </div>
                <div className="w-6 flex justify-center">
                  {tx.is_flagged
                    ? <AlertTriangle size={14} className="text-arth-rose" />
                    : <CheckCircle2 size={14} className="text-arth-emerald/50" />
                  }
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
