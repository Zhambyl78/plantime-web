import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import Groq from 'groq-sdk'

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('pt_token')?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'plantime-secret-key')
    const { payload } = await jwtVerify(token, secret)
    return payload.userId as number
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const audioFile = formData.get('audio') as File
  if (!audioFile) return NextResponse.json({ error: 'No audio' }, { status: 400 })

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
  
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-large-v3',
    language: 'ru',
    response_format: 'text',
  })

  // Extract tasks via LLM
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 500,
    messages: [
      { role: 'system', content: 'Extract tasks from text. Return ONLY JSON array: [{"text":"task","time":"HH:MM or null"}]. No markdown.' },
      { role: 'user', content: transcription as unknown as string }
    ],
  })

  let tasks = []
  try {
    const raw = (completion.choices[0]?.message?.content ?? '[]').replace(/```json|```/g, '').trim()
    tasks = JSON.parse(raw)
  } catch { tasks = [] }

  return NextResponse.json({ 
    transcription: transcription as unknown as string,
    tasks 
  })
}
