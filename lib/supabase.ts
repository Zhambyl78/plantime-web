import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Task {
  id: number
  user_id: number
  text: string
  time: string | null
  day: string
  done: boolean
  created_at: string
}

export async function getTasks(userId: number, startDay: string, endDay: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('day', startDay)
    .lte('day', endDay)
    .order('day', { ascending: true })
    .order('time', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data ?? []
}

export async function addTask(userId: number, text: string, day: string, time?: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, text, day, time: time ?? null, done: false })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<void> {
  const { error } = await supabase.from('tasks').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: number): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
