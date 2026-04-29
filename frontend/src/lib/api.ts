import axios from 'axios'
import type {
  AuthTokens, User,
  Transaction, TransactionCreate, TransactionSummary,
  SimulationResponse, CreditScoreResponse,
  BehavioralData, FraudCheckResponse,
  ChatMessage, ChatResponse,
} from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inject auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arth_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('arth_access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; full_name: string; password: string; monthly_income?: number }) =>
    api.post<AuthTokens>('/auth/register', data).then(r => r.data),

  login: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/login', { email, password }).then(r => r.data),

  me: () => api.get<User>('/auth/me').then(r => r.data),

  updateMe: (data: Partial<User>) =>
    api.patch<User>('/auth/me', data).then(r => r.data),
}

// ─── Transactions ──────────────────────────────────────────────────────────────
export const txApi = {
  create: (data: TransactionCreate) =>
    api.post<Transaction>('/transactions/', data).then(r => r.data),

  list: (limit = 50, offset = 0) =>
    api.get<Transaction[]>('/transactions/', { params: { limit, offset } }).then(r => r.data),

  summary: () =>
    api.get<TransactionSummary>('/transactions/summary').then(r => r.data),
}

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiApi = {
  simulate: (months_ahead = 6, scenario?: object) =>
    api.post<SimulationResponse>('/ai/simulate', { months_ahead, scenario }).then(r => r.data),

  creditScore: () =>
    api.get<CreditScoreResponse>('/ai/credit-score').then(r => r.data),

  fraudCheck: (data: BehavioralData) =>
    api.post<FraudCheckResponse>('/ai/fraud-check', data).then(r => r.data),

  chat: (message: string, history: ChatMessage[]) =>
    api.post<ChatResponse>('/ai/chat', { message, history }).then(r => r.data),
}
