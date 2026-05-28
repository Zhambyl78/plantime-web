import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { createHmac } from 'crypto'

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { hash, ...rest } = data

  // Проверяем подпись от Telegram
  const botToken = process.env.TELEGRAM_TOKEN!
  const checkString = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key]}`)
    .join('\n')
  
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const hmac = createHmac('sha256', secretKey).update(checkString).digest('hex')
  
  if (hmac !== hash) {
    return NextResponse.json({ error: 'Invalid hash' }, { status: 401 })
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'plantime-secret-key')
  const token = await new SignJWT({ 
    userId: data.id, 
    name: data.first_name, 
    photo: data.photo_url 
  })
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