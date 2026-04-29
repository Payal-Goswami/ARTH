import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, Brain, CreditCard,
  ShieldAlert, MessageSquare, LogOut, ChevronRight, Bell
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/dashboard/twin', icon: Brain, label: 'Financial Twin' },
  { to: '/dashboard/credit', icon: CreditCard, label: 'Credit Score' },
  { to: '/dashboard/fraud', icon: ShieldAlert, label: 'Fraud Shield' },
  { to: '/dashboard/advisor', icon: MessageSquare, label: 'AI Advisor' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-arth-dark flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-arth-dark-4 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-arth-dark-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-arth-gold to-arth-gold-light flex items-center justify-center animate-pulse_glow">
              <span className="font-display font-bold text-arth-dark text-sm">A</span>
            </div>
            <div>
              <div className="font-display font-semibold text-foreground">ARTH</div>
              <div className="text-xs text-muted-foreground">Financial Intelligence</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-30" />
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-arth-dark-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2">
            <div className="w-8 h-8 rounded-full bg-arth-gold/20 flex items-center justify-center text-arth-gold text-sm font-semibold">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{user?.full_name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-item w-full text-arth-rose hover:text-arth-rose hover:bg-rose-950/20"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-arth-dark-4 bg-arth-dark/80 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Welcome back, <span className="text-foreground font-medium">{user?.full_name?.split(' ')[0]}</span>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-arth-dark-3 transition-colors text-muted-foreground hover:text-foreground">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-arth-gold rounded-full" />
          </button>
        </header>

        {/* Page content */}
        <div className="p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
