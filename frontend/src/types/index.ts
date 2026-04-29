// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  monthly_income?: number
  risk_profile: 'conservative' | 'moderate' | 'aggressive'
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

// ─── Transactions ──────────────────────────────────────────────────────────────
export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment'
export type TransactionCategory =
  | 'food' | 'transport' | 'entertainment' | 'utilities'
  | 'healthcare' | 'education' | 'shopping' | 'rent'
  | 'salary' | 'investment' | 'other'

export interface Transaction {
  id: number
  user_id: number
  amount: number
  type: TransactionType
  category: string
  description?: string
  merchant?: string
  is_recurring: boolean
  is_flagged: boolean
  fraud_score: number
  location?: string
  created_at: string
}

export interface TransactionCreate {
  amount: number
  type: TransactionType
  category: string
  description?: string
  merchant?: string
  is_recurring?: boolean
  location?: string
  device_id?: string
}

export interface TransactionSummary {
  total_income: number
  total_expense: number
  net_savings: number
  top_categories: { category: string; amount: number }[]
  monthly_trend: { month: string; income: number; expense: number }[]
  flagged_count: number
}

// ─── AI Financial Twin ─────────────────────────────────────────────────────────
export interface FutureSnapshot {
  month: string
  projected_balance: number
  projected_income: number
  projected_expense: number
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  confidence: number
}

export interface SimulationResponse {
  snapshots: FutureSnapshot[]
  overall_risk: string
  ai_summary: string
  recommendations: string[]
}

// ─── Credit ────────────────────────────────────────────────────────────────────
export interface CreditScoreResponse {
  score: number
  grade: string
  factors: Record<string, number>
  reasons: string[]
  improvements: string[]
  ai_explanation: string
  what_if_scenarios: Record<string, number>
  computed_at: string
}

// ─── Fraud / Behavioral ────────────────────────────────────────────────────────
export interface BehavioralData {
  session_id?: string
  device_fingerprint?: string
  ip_address?: string
  location?: string
  typing_pattern?: number[]
  mouse_pattern?: number[]
  touch_pattern?: number[]
}

export interface FraudCheckResponse {
  anomaly_score: number
  is_anomalous: boolean
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  flagged_reason?: string
  recommendations: string[]
}

// ─── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  reply: string
  suggestions: string[]
}
