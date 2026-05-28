'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import VoiceButton from '@/components/VoiceButton'
import TaskCard from '@/components/TaskCard'
import AddTaskModal from '@/components/AddTaskModal'

interface Task {
  id: number
  user_id: number
  text: string
  time: string | null
  day: string
  done: boolean
}

const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function Dashboard() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalDay, setAddModalDay] = useState('')
  const [voiceTranscription, setVoiceTranscription] = useState('')
  const [userName, setUserName] = useState('')

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const startDay = format(weekDays[0], 'yyyy-MM-dd')
  const endDay = format(weekDays[6], 'yyyy-MM-dd')

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/tasks?start=${startDay}&end=${endDay}`)
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setTasks(data)
    setLoading(false)
  }, [startDay, endDay, router])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const getTasksForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return tasks.filter(t => t.day === dayStr)
  }

  const handleToggleDone = async (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, updates: { done: !task.done } })
    })
  }

  const handleDelete = async (taskId: number) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' })
  }

  const handleEdit = async (task: Task, newText: string) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, text: newText } : t))
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, updates: { text: newText } })
    })
  }

  const handleAddTask = async (text: string, day: string, time?: string) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, day, time })
    })
    const newTask = await res.json()
    setTasks(prev => [...prev, newTask])
  }

  const handleVoiceTasks = async (newTasks: { text: string; time: string | null }[]) => {
    const dayStr = format(selectedDay, 'yyyy-MM-dd')
    for (const t of newTasks) {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t.text, day: dayStr, time: t.time })
      })
      const newTask = await res.json()
      setTasks(prev => [...prev, newTask])
    }
  }

  const todayTasks = getTasksForDay(selectedDay)
  const todayDone = todayTasks.filter(t => t.done).length
  const totalWeekTasks = tasks.length
  const doneWeekTasks = tasks.filter(t => t.done).length

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,122,255,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(175,82,222,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              📅 PlanTime
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {format(new Date(), 'EEEE, d MMMM', { locale: ru })}
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="glass" style={{ padding: '12px 20px', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--accent)' }}>
                {doneWeekTasks}/{totalWeekTasks}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>за неделю</div>
            </div>
          </div>
        </header>

        {/* Week navigation */}
        <div className="glass animate-fade-in" style={{ borderRadius: '20px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '20px', padding: '4px 8px',
              borderRadius: '8px', transition: 'all 0.2s'
            }}>‹</button>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
              {format(weekDays[0], 'd MMM', { locale: ru })} — {format(weekDays[6], 'd MMM yyyy', { locale: ru })}
            </span>
            <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '20px', padding: '4px 8px',
              borderRadius: '8px', transition: 'all 0.2s'
            }}>›</button>
          </div>

          {/* Day pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {weekDays.map((day, i) => {
              const dayTasks = getTasksForDay(day)
              const isSelected = isSameDay(day, selectedDay)
              const isToday = isSameDay(day, new Date())
              const doneTasks = dayTasks.filter(t => t.done).length

              return (
                <button key={i} onClick={() => setSelectedDay(day)} style={{
                  padding: '10px 4px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  background: isSelected ? 'var(--accent)' : isToday ? 'rgba(0,122,255,0.15)' : 'transparent',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '500',
                    color: isSelected ? 'white' : 'var(--text-secondary)'
                  }}>{DAYS_RU[i]}</span>
                  <span style={{
                    fontSize: '18px', fontWeight: '700',
                    color: isSelected ? 'white' : isToday ? 'var(--accent)' : 'var(--text-primary)'
                  }}>{format(day, 'd')}</span>
                  {dayTasks.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: Math.min(dayTasks.length, 3) }).map((_, j) => (
                        <div key={j} style={{
                          width: '4px', height: '4px', borderRadius: '50%',
                          background: j < doneTasks ? 'var(--accent-green)' : (isSelected ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)')
                        }} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected day tasks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div>
            {/* Day header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {format(selectedDay, 'EEEE, d MMMM', { locale: ru })}
                </h2>
                {todayTasks.length > 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {todayDone} из {todayTasks.length} выполнено
                  </p>
                )}
              </div>
              <button onClick={() => { setAddModalDay(format(selectedDay, 'yyyy-MM-dd')); setShowAddModal(true) }}
                style={{
                  background: 'var(--accent)', border: 'none', borderRadius: '12px',
                  padding: '10px 20px', color: 'white', fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 16px rgba(0,122,255,0.3)'
                }}>
                + Добавить
              </button>
            </div>

            {/* Progress bar */}
            {todayTasks.length > 0 && (
              <div style={{
                height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px',
                marginBottom: '16px', overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px', background: 'var(--accent-green)',
                  width: `${(todayDone / todayTasks.length) * 100}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            )}

            {/* Task list */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Загрузка...
              </div>
            ) : todayTasks.length === 0 ? (
              <div className="glass" style={{
                borderRadius: '20px', padding: '48px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                  Задач нет. Добавь первую!
                </p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '8px' }}>
                  Используй кнопку "+" или голосовой ввод
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {todayTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleDone(task)}
                    onDelete={() => handleDelete(task.id)}
                    onEdit={(text) => handleEdit(task, text)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Voice transcription feedback */}
        {voiceTranscription && (
          <div className="glass animate-fade-in" style={{
            borderRadius: '16px', padding: '16px', marginTop: '16px',
            border: '1px solid rgba(0,122,255,0.3)'
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              🎤 Распознано: <span style={{ color: 'var(--text-primary)' }}>{voiceTranscription}</span>
            </p>
          </div>
        )}
      </div>

      {/* Voice button (floating) */}
      <VoiceButton
        onTasks={handleVoiceTasks}
        onTranscription={setVoiceTranscription}
      />

      {/* Add task modal */}
      {showAddModal && (
        <AddTaskModal
          day={addModalDay}
          onAdd={handleAddTask}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </main>
  )
}
