import { createClient } from "@supabase/supabase-js"

// 检查环境变量是否存在
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 创建Supabase客户端（如果环境变量存在）
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// 检查Supabase是否可用
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// 数据库类型定义
export interface TaskSection {
  id: string
  title: string
  order_index: number
  created_at?: string
  updated_at?: string
}

export interface Task {
  id: string
  section_id: string
  title: string
  completed: boolean
  order_index: number
  created_at?: string
  updated_at?: string
}
