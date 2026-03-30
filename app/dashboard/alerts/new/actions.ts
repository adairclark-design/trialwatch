'use server'

import { getDb } from '@/db'
import { alertProfiles } from '@/db/schema'

const DEMO_USER_ID = '85f375c0-2837-4deb-908d-a5a636952008'

export async function createAlertProfile(payload: {
  name: string
  conditions: string[]
  statuses: string[]
  phases: string[] | null
  sponsor_types: string[] | null
  email: string
}) {
  try {
    const db = await getDb()
    const newProfile = await db.insert(alertProfiles).values({
      id: crypto.randomUUID(),
      user_id: DEMO_USER_ID,
      ...payload,
      country: 'United States',
      created_at: new Date(),
      active: true,
      frequency: 'daily'
    }).returning()
    
    return { data: newProfile[0] }
  } catch (error: any) {
    return { error: error.message }
  }
}
