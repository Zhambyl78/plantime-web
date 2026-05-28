import { createHmac } from 'crypto'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export function verifyTelegramAuth(data: TelegramUser, botToken: string): boolean {
  const { hash, ...rest } = data
  const checkString = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key as keyof typeof rest]}`)
    .join('\n')
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const hmac = createHmac('sha256', secretKey).update(checkString).digest('hex')
  const isValid = hmac === hash
  const isRecent = Date.now() / 1000 - data.auth_date < 86400
  return isValid && isRecent
}
