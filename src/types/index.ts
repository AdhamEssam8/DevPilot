export interface User {
  id: string
  email: string
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  billing_address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  default_payment_terms: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  client_id?: string
  name: string
  description?: string
  tech_stack?: string[]
  repo_url?: string
  status: 'active' | 'archived' | 'completed'
  created_at: string
  updated_at: string
  client?: Client
}

export interface Task {
  id: string
  project_id: string
  user_id: string
  title: string
  description?: string
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
  order_index: number
  estimate_hours?: number
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  qty: number
  rate: number
  amount: number
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  client_id?: string
  project_id?: string
  invoice_number: string
  issue_date: string
  due_date?: string
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  subtotal: number
  tax: number
  discount: number
  total: number
  pdf_path?: string
  stripe_payment_intent_id?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  client?: Client
  project?: Project
  items?: InvoiceItem[]
}

export interface CompanySettings {
  id: string
  user_id: string
  company_name?: string
  company_logo?: string
  default_hourly_rate: number
  invoice_footer?: string
  bank_name?: string
  account_number?: string
  account_holder?: string
  account_type?: string
  iban?: string
  created_at: string
  updated_at: string
}

export interface ProjectPlan {
  project_name: string
  summary: string
  estimated_weeks: number
  phases: {
    name: string
    description: string
    tasks: {
      title: string
      description: string
      estimate_hours: number
      priority: 'high' | 'medium' | 'low'
    }[]
  }[]
}

export interface ProjectResource {
  id: string
  project_id: string
  user_id: string
  name: string
  file_type: string
  file_size?: number
  file_url?: string
  storage_path?: string
  task_id?: string
  created_at: string
  updated_at: string
}

export interface ProjectNote {
  id: string
  project_id: string
  user_id: string
  title: string
  content?: string
  tags?: string[]
  task_id?: string
  resource_id?: string
  created_at: string
  updated_at: string
}

export interface ProjectChatMessage {
  id: string
  project_id: string
  user_id: string
  message: string
  resource_id?: string
  created_at: string
  user?: {
    email: string
  }
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type ProjectStatus = 'active' | 'archived' | 'completed'
