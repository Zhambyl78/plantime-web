import { NextRequest, NextResponse } from 'next/server'
import { verifyTelegramAuth, TelegramUser } from '@/lib/auth'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  const data = await req.json() as TelegramUser
  const botToken = process.env.TELEGRAM_TOKEN!
  
  if (!verifyTelegramAuth(data, botToken)) {
    return NextResponse.json({ error: 'Invalid auth' }, { status: 401 })
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'plantime-secret-key')
  const token = await new SignJWT({ userId: data.id, name: data.first_name, photo: data.photo_url })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret)

  const response = NextResponse.json({ ok: true, name: data.first_name })
  response.cookies.set('pt_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })
  return response
}
