'use server'
export const runtime = 'edge'

import { getDb } from '@/db'
import { trialBookmarks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const DEMO_USER_ID = '85f375c0-2837-4deb-908d-a5a636952008'

export async function toggleBookmark(nctId: string, studyData: any) {
  const db = getDb()
  
  // Check if already bookmarked
  const existing = await db
    .select()
    .from(trialBookmarks)
    .where(and(
      eq(trialBookmarks.user_id, DEMO_USER_ID),
      eq(trialBookmarks.nct_id, nctId)
    ))
    .limit(1)

  if (existing.length > 0) {
    // Remove bookmark
    await db
      .delete(trialBookmarks)
      .where(eq(trialBookmarks.id, existing[0].id))
    
    revalidatePath('/dashboard/shortlist')
    revalidatePath('/dashboard/results/[profileId]', 'page')
    return { bookmarked: false }
  } else {
    // Add bookmark
    await db
      .insert(trialBookmarks)
      .values({
        id: crypto.randomUUID(),
        user_id: DEMO_USER_ID,
        nct_id: nctId,
        study_data: studyData,
        created_at: new Date()
      })
    
    revalidatePath('/dashboard/shortlist')
    revalidatePath('/dashboard/results/[profileId]', 'page')
    return { bookmarked: true }
  }
}
