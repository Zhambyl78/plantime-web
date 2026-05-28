'use client'

import { useState, useRef } from 'react'

interface Props {
  onTasks: (tasks: { text: string; time: string | null }[]) => void
  onTranscription: (text: string) => void
}

export default function VoiceButton({ onTasks, onTranscription }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(blob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      alert('Нет доступа к микрофону')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    setIsProcessing(true)
  }

  const processAudio = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'voice.webm')
      const res = await fetch('/api/voice', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.transcription) onTranscription(data.transcription)
      if (data.tasks?.length) onTasks(data.tasks)
    } catch (err) {
      console.error('Voice error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 100 }}>
      {/* Processing indicator */}
      {isProcessing && (
        <div className="glass animate-fade-in" style={{
          position: 'absolute', bottom: '70px', right: 0,
          borderRadius: '12px', padding: '8px 14px', whiteSpace: 'nowrap',
          fontSize: '13px', color: 'var(--text-secondary)'
        }}>
          ⏳ Обрабатываю...
        </div>
      )}

      {/* Voice button */}
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={isProcessing}
        style={{
          width: '60px', height: '60px', borderRadius: '50%', border: 'none',
          background: isRecording
            ? 'var(--accent-red)'
            : 'linear-gradient(135deg, #007AFF, #5856D6)',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', boxShadow: isRecording
            ? '0 0 0 8px rgba(255,59,48,0.2), 0 8px 24px rgba(255,59,48,0.4)'
            : '0 8px 24px rgba(0,122,255,0.4)',
          transition: 'all 0.3s ease',
          animation: isRecording ? 'pulse-ring 1.5s infinite' : 'none',
          opacity: isProcessing ? 0.6 : 1
        }}
      >
        {isProcessing ? '⏳' : isRecording ? '⏹' : '🎤'}
      </button>

      {/* Label */}
      <div style={{
        textAlign: 'center', marginTop: '6px',
        fontSize: '11px', color: 'var(--text-tertiary)'
      }}>
        {isRecording ? 'Отпусти' : isProcessing ? '...' : 'Голос'}
      </div>
    </div>
  )
}
