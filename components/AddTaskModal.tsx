'use client'

import { useState } from 'react'

interface Props {
  day: string
  onAdd: (text: string, day: string, time?: string) => void
  onClose: () => void
}

export default function AddTaskModal({ day, onAdd, onClose }: Props) {
  const [text, setText] = useState('')
  const [time, setTime] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text.trim(), day, time || undefined)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />

      {/* Modal */}
      <div className="glass animate-slide-up" style={{
        borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '500px',
        position: 'relative', zIndex: 1
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>
          Новая задача
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Описание задачи..."
            autoFocus
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)', fontSize: '16px', outline: 'none',
              fontFamily: 'inherit', marginBottom: '12px'
            }}
          />

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <div style={{
              flex: 1, padding: '12px 16px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)', fontSize: '14px',
              display: 'flex', alignItems: 'center'
            }}>
              📅 {day}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
              background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)',
              fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit'
            }}>Отмена</button>
            <button type="submit" style={{
              flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
              background: 'var(--accent)', color: 'white',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(0,122,255,0.3)'
            }}>Добавить</button>
          </div>
        </form>
      </div>
    </div>
  )
}
