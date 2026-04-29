import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Loader2, Bot, User, Zap } from 'lucide-react'
import { aiApi } from '@/lib/api'
import type { ChatMessage } from '@/types'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const STARTER_PROMPTS = [
  'How can I improve my credit score?',
  'Analyse my spending patterns',
  'What is my biggest financial risk?',
  'How much should I save each month?',
  'Explain my financial health',
]

interface Message extends ChatMessage {
  id: string
  suggestions?: string[]
  isLoading?: boolean
}

export default function AdvisorPage() {
  const user = useAuthStore(s => s.user)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm ARTH, your AI Financial Advisor. I can help you understand your finances, improve your credit score, simulate future scenarios, and protect you from fraud. What would you like to know today?`,
      suggestions: STARTER_PROMPTS.slice(0, 3),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const msgText = (text || input).trim()
    if (!msgText || loading) return

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: msgText,
    }
    const loadingMsg: Message = {
      id: `a_loading_${Date.now()}`,
      role: 'assistant',
      content: '',
      isLoading: true,
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages
        .filter(m => !m.isLoading && m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const response = await aiApi.chat(msgText, history)

      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          suggestions: response.suggestions,
        },
      ])
    } catch {
      setMessages(prev => prev.filter(m => !m.isLoading))
      toast.error('Failed to get AI response. Please try again.')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-arth-gold/10 flex items-center justify-center">
          <MessageSquare size={24} className="text-arth-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">AI Financial Advisor</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Powered by Gemini — ask anything about your finances
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-arth-emerald/10 border border-arth-emerald/20">
          <span className="w-1.5 h-1.5 rounded-full bg-arth-emerald animate-pulse" />
          <span className="text-xs text-arth-emerald">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.role === 'assistant'
                  ? 'bg-arth-gold/20'
                  : 'bg-arth-dark-3 border border-arth-dark-4'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot size={14} className="text-arth-gold" />
                  : <User size={14} className="text-muted-foreground" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-arth-gold text-arth-dark font-medium rounded-tr-sm'
                    : 'bg-arth-dark-3 border border-arth-dark-4 text-foreground rounded-tl-sm'
                }`}>
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 size={13} className="animate-spin" />
                      <span>Thinking…</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Suggestion chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-arth-dark-4 border border-arth-dark-4 hover:border-arth-gold/40 hover:text-arth-gold text-muted-foreground transition-all duration-200"
                      >
                        <Zap size={10} />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 mt-4">
        {/* Quick prompts (only when empty) */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {STARTER_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p)}
                className="px-3 py-1.5 text-xs rounded-full bg-arth-dark-3 border border-arth-dark-4 hover:border-arth-gold/40 hover:text-arth-gold text-muted-foreground transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 bg-arth-dark-2 border border-arth-dark-4 rounded-2xl px-4 py-3 focus-within:border-arth-gold/50 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl bg-arth-gold flex items-center justify-center transition-all hover:bg-arth-gold-light disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {loading
              ? <Loader2 size={15} className="animate-spin text-arth-dark" />
              : <Send size={15} className="text-arth-dark" />
            }
          </button>
        </div>
        <p className="text-xs text-muted-foreground/50 text-center mt-2">
          ARTH AI · Powered by Google Gemini · Financial advice is for informational purposes only
        </p>
      </div>
    </div>
  )
}
