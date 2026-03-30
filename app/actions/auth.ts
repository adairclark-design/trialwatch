'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (email) {
    const cookieStore = await cookies()
    cookieStore.set('auth_session', email, { 
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true, 
      path: '/' 
    })
    return { success: true }
  }
  return { error: 'Invalid credentials' }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_session')
  redirect('/login')
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('auth_session')
  return session ? { user: { email: session.value } } : null
}
