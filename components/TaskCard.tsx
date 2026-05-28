'use client'

import { useState } from 'react'

interface Task {
  id: number
  text: string
  time: string | null
  done: boolean
}

interface Props {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onEdit: (text: string) => void
}

export default function TaskCard({ task, onToggle, onDelete, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const [showActions, setShowActions] = useState(false)

  const handleSave = () => {
    if (editText.trim()) onEdit(editText.trim())
    setIsEditing(false)
  }

  return (
    <div className="glass glass-hover animate-fade-in" style={{
      borderRadius: '16px', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: '12px',
      opacity: task.done ? 0.65 : 1,
      transition: 'all 0.2s ease'
    }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Checkbox */}
      <button onClick={onToggle} style={{
        width: '24px', height: '24px', borderRadius: '8px', flexShrink: 0,
        border: task.done ? 'none' : '2px solid rgba(255,255,255,0.25)',
        background: task.done ? 'var(--accent-green)' : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease'
      }}>
        {task.done && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <input
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false) }}
            autoFocus
            style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '15px', fontFamily: 'inherit'
            }}
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            style={{
              fontSize: '15px', color: 'var(--text-primary)',
              textDecoration: task.done ? 'line-through' : 'none',
              display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}
          >
            {task.text}
          </span>
        )}
        {task.time && (
          <span style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '2px', display: 'block' }}>
            ⏰ {task.time}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', gap: '6px', opacity: showActions ? 1 : 0,
        transition: 'opacity 0.15s ease'
      }}>
        <button onClick={() => setIsEditing(true)} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
          width: '30px', height: '30px', cursor: 'pointer', fontSize: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)'
        }}>✏️</button>
        <button onClick={onDelete} style={{
          background: 'rgba(255,59,48,0.15)', border: 'none', borderRadius: '8px',
          width: '30px', height: '30px', cursor: 'pointer', fontSize: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-red)'
        }}>🗑</button>
      </div>
    </div>
  )
}
