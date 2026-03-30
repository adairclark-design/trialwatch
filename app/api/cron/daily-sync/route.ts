import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/db'
import { alertProfiles, trialSnapshots, digestLog } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { searchAllTrials } from '@/lib/clinicaltrials'
import { Resend } from 'resend'
import { generateDigestHtml } from '@/lib/email'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Called by Vercel Cron every Tuesday at 8am UTC
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Defer initialization to runtime to avoid build crashes on Cloudflare Pages
  const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy')

  // Get all active profiles
  let profiles: any[] = []
  const db = getDb()
  try {
    profiles = await db.select().from(alertProfiles).where(eq(alertProfiles.active, true))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load profiles' }, { status: 500 })
  }

  const results = []

  for (const profile of profiles) {
    try {
      // Fetch current trials from CT.gov
      const studies = await searchAllTrials({
        conditions: profile.conditions,
        statuses: profile.statuses,
        country: profile.country,
        phases: profile.phases || undefined,
        sponsorTypes: profile.sponsor_types || undefined,
      })

      // Get existing snapshots for this profile
      const existingSnapshots = await db
        .select({ nct_id: trialSnapshots.nct_id, status_at_snapshot: trialSnapshots.status_at_snapshot })
        .from(trialSnapshots)
        .where(eq(trialSnapshots.profile_id, profile.id))

      const existingNctIds = new Set((existingSnapshots || []).map(s => s.nct_id))
      const existingStatusMap = new Map((existingSnapshots || []).map(s => [s.nct_id, s.status_at_snapshot]))

      const newTrials = []
      const changedTrials = []
      const now = new Date()

      for (const study of studies) {
        const nctId = study.protocolSection.identificationModule.nctId
        const currentStatus = study.protocolSection.statusModule.overallStatus

        if (!existingNctIds.has(nctId)) {
          // Brand new trial
          newTrials.push(study)
          await db.insert(trialSnapshots).values({
            id: crypto.randomUUID(),
            profile_id: profile.id,
            nct_id: nctId,
            study_data: study as any,
            status_at_snapshot: currentStatus,
            snapshot_date: now
          })
        } else {
          // Update last_seen
          await db.update(trialSnapshots)
            .set({ 
              snapshot_date: now, 
              study_data: study as any, 
              status_at_snapshot: currentStatus 
            })
            .where(
              and(
                eq(trialSnapshots.profile_id, profile.id), 
                eq(trialSnapshots.nct_id, nctId)
              )
            )

          // Detect status change
          const oldStatus = existingStatusMap.get(nctId)
          if (oldStatus && oldStatus !== currentStatus) {
            changedTrials.push({ study, oldStatus, newStatus: currentStatus })
          }
        }
      }

      // Update last_synced_at
      await db.update(alertProfiles)
        .set({ last_synced_at: now })
        .where(eq(alertProfiles.id, profile.id))

      // Send digest if there's anything new or changed
      if (newTrials.length > 0 || changedTrials.length > 0) {
        const html = generateDigestHtml(profile, newTrials, changedTrials)

        await resend.emails.send({
          from: 'TrialWatch <onboarding@resend.dev>',
          to: profile.email,
          subject: `TrialWatch: ${newTrials.length} new + ${changedTrials.length} changed trials — ${profile.name}`,
          html,
        })

        await db.insert(digestLog).values({
          id: crypto.randomUUID(),
          profile_id: profile.id,
          new_trials_count: newTrials.length,
          changed_trials_count: changedTrials.length,
          email_sent_to: profile.email,
          created_at: now
        })
      }

      results.push({
        profile_id: profile.id,
        new: newTrials.length,
        changed: changedTrials.length,
        total: studies.length,
      })
    } catch (err) {
      console.error(`Error processing profile ${profile.id}:`, err)
      results.push({ profile_id: profile.id, error: String(err) })
    }
  }

  return NextResponse.json({ success: true, results })
}
