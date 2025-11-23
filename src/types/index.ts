export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Chat {
  id: string
  title: string
  created_at: Date
  updated_at: Date
}

export interface ChatLog {
  id: string
  user_id: string
  query: string
  response: string
  ai_model: string
  sensitivity_level: string
  created_at: Date
}
