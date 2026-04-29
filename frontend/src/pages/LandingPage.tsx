import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Shield, TrendingUp, ArrowRight, Zap, Eye, Lock } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Financial Twin',
    desc: 'Simulate your financial future before making decisions. See the outcome months ahead.',
    color: '#C9A84C',
  },
  {
    icon: Eye,
    title: 'Explainable Credit',
    desc: 'Beyond scores — understand why, and get a clear roadmap to improve your creditworthiness.',
    color: '#00D4FF',
  },
  {
    icon: Shield,
    title: 'Behavioral Security',
    desc: 'Continuous identity authentication through your unique behavioral biometrics.',
    color: '#00E5A0',
  },
]

const stats = [
  { value: '3 Core', label: 'AI Modules' },
  { value: '< 2s', label: 'Prediction Time' },
  { value: 'Real-time', label: 'Fraud Detection' },
  { value: 'XAI', label: 'Explainable AI' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-arth-dark overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-arth-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-arth-cyan/4 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arth-gold to-arth-gold-light flex items-center justify-center">
            <span className="font-display font-bold text-arth-dark text-sm">A</span>
          </div>
          <span className="font-display font-semibold text-lg text-foreground">ARTH</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="arth-btn-ghost text-sm">Sign In</Link>
          <Link to="/register" className="arth-btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-arth-gold/30 bg-arth-gold/5 text-arth-gold text-xs font-medium mb-8">
            <Zap size={12} />
            Powered by Google Gemini AI
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold text-foreground leading-tight mb-6">
            The Brain of<br />
            <span className="gold-text">Next-Gen Banking</span>
          </h1>

          <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-4 font-body font-light">
            We don't track your money — we simulate your financial future.
          </p>
          <p className="text-muted-foreground/70 text-base max-w-xl mx-auto mb-12">
            Finance today is reactive. ARTH makes it proactive with AI that predicts, explains, and protects.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="arth-btn-primary flex items-center gap-2 text-base px-8 py-3"
            >
              Start for Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="arth-btn-ghost text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-arth-dark-4 rounded-2xl overflow-hidden border border-arth-dark-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-arth-dark-2 px-6 py-5 text-center">
              <div className="font-display text-2xl font-bold gold-text">{s.value}</div>
              <div className="text-muted-foreground text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Tagline strip */}
      <section className="relative z-10 border-y border-arth-dark-4 py-4 overflow-hidden">
        <div className="flex gap-16 animate-[shimmer_20s_linear_infinite] whitespace-nowrap">
          {Array(4).fill(['Predict', '•', 'Explain', '•', 'Protect', '•']).flat().map((w, i) => (
            <span key={i} className={`text-sm font-medium ${w === '•' ? 'text-arth-gold' : 'text-muted-foreground'}`}>
              {w}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            Three AI Engines. One Platform.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Each module is powered by Gemini AI and built for transparent, explainable decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              className="arth-card group hover:border-arth-dark-4/80 transition-all duration-300"
              style={{ borderColor: `${f.color}22` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${f.color}18` }}
              >
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-24 text-center">
        <div className="arth-card-glow">
          <Lock className="mx-auto mb-4 text-arth-gold" size={32} />
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Your finances deserve intelligence.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands making smarter financial decisions with ARTH's AI-first platform.
          </p>
          <Link to="/register" className="arth-btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-arth-dark-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          © 2024 ARTH. Built for the future of finance.
          <span className="mx-3 text-arth-dark-4">|</span>
          <span className="gold-text font-medium">Predict • Explain • Protect</span>
        </p>
      </footer>
    </div>
  )
}
