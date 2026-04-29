import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    monthly_income: '',
  })
  const [showPass, setShowPass] = useState(false)
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : undefined,
      })
      toast.success('Account created! Welcome to ARTH.')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-arth-dark flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-arth-cyan/4 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arth-gold to-arth-gold-light flex items-center justify-center">
              <span className="font-display font-bold text-arth-dark">A</span>
            </div>
            <span className="font-display font-semibold text-xl text-foreground">ARTH</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground text-sm">Start predicting your financial future today</p>
        </div>

        <form onSubmit={handleSubmit} className="arth-card space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              className="arth-input"
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="rahul@example.com"
              className="arth-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className="arth-input pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Monthly Income <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <input
                type="number"
                name="monthly_income"
                value={form.monthly_income}
                onChange={handleChange}
                placeholder="50000"
                className="arth-input pl-7"
                min={0}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Used for more accurate AI predictions</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="arth-btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-arth-gold hover:text-arth-gold-light transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
