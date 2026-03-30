import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_session')
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://trialwatch.pages.dev'))
}
