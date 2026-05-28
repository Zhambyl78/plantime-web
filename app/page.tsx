'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const telegramRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!telegramRef.current) return
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_BOT_USERNAME ?? 'PlanTimeAI_bot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '12')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    telegramRef.current.appendChild(script)

    ;(window as any).onTelegramAuth = async (user: any) => {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
      if (res.ok) router.push('/dashboard')
    }
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,122,255,0.3) 0%, transparent 70%)',
          filter: 'blur(40px)', animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%', width: '350px', height: '350px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(175,82,222,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)', animation: 'float 10s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '300px', height: '300px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,199,89,0.2) 0%, transparent 70%)',
          filter: 'blur(50px)', transform: 'translate(-50%, -50%)', animation: 'float 12s ease-in-out infinite'
        }} />
      </div>

      <div className="glass animate-slide-up" style={{
        borderRadius: '28px', padding: '48px 40px', maxWidth: '420px', width: '100%',
        textAlign: 'center', position: 'relative', zIndex: 1
      }}>
        {/* Logo */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #007AFF, #5856D6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,122,255,0.4)',
          fontSize: '36px'
        }}>
          📅
        </div>

        <h1 style={{
          fontSize: '32px', fontWeight: '700', marginBottom: '8px',
          color: 'var(--text-primary)', letterSpacing: '-0.5px'
        }}>
          PlanTime
        </h1>
        <p style={{
          fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '36px', lineHeight: '1.5'
        }}>
          Умный планировщик задач<br />с голосовым вводом
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px', textAlign: 'left' }}>
          {[
            { icon: '🎤', text: 'Голосовой ввод задач' },
            { icon: '📱', text: 'Синхронизация с Telegram ботом' },
            { icon: '📅', text: 'Недельный вид задач' },
            { icon: '✅', text: 'Отмечай выполненные задачи' },
          ].map((f, i) => (
            <div key={i} className="glass" style={{
              padding: '12px 16px', borderRadius: '14px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>{f.icon}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Telegram Login */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div ref={telegramRef} />
        </div>

        <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          Вход через Telegram — безопасно и быстро
        </p>
      </div>
    </main>
  )
}
