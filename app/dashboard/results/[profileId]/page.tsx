import { getDb } from '@/db'
import { alertProfiles, trialBookmarks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { searchAllTrials, CTStudy } from '@/lib/clinicaltrials'
import TrialCard from '@/components/TrialCard'
import Link from 'next/link'
import PrintButton from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: { profileId: string }
}

const DEMO_USER_ID = '85f375c0-2837-4deb-908d-a5a636952008'

export default async function ResultsPage(props: { params: Promise<{ profileId: string }> }) {
  const params = await props.params;

  const db = await getDb()
  const [profile] = await db
    .select()
    .from(alertProfiles)
    .where(
      and(
        eq(alertProfiles.id, params.profileId),
        eq(alertProfiles.user_id, DEMO_USER_ID)
      )
    )
    .limit(1)

  if (!profile) redirect('/dashboard')

  // Fetch bookmarked states for TrialCard context
  const bookmarks = await db
    .select({ nct_id: trialBookmarks.nct_id })
    .from(trialBookmarks)
    .where(eq(trialBookmarks.user_id, DEMO_USER_ID))
  
  const bookmarkedSet = new Set(bookmarks.map(b => b.nct_id))

  let studies: CTStudy[] = []
  let fetchError = ''

  try {
    studies = await searchAllTrials({
      conditions: profile.conditions,
      statuses: profile.statuses,
      country: profile.country,
      phases: profile.phases || undefined,
      sponsorTypes: profile.sponsor_types || undefined,
      pageSize: 100,
    })
  } catch (e) {
    fetchError = 'Could not load results from ClinicalTrials.gov. Please try again.'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900">{profile.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            Live from ClinicalTrials.gov
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Top bar */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4 uppercase tracking-wide print:hidden"
          >
            ← Back to Monitors
          </Link>
          
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{profile.name} — Current Results</h1>
              <p className="text-lg text-slate-600">
                Fetching live data from ClinicalTrials.gov V2 API
              </p>
            </div>
            
            <div className="flex items-center gap-3 print:hidden">
              <PrintButton />
              <Link
                href={`/dashboard/alerts/${profile.id}/edit`}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Edit Filters
              </Link>
            </div>
          </div>
        </div>

        {/* Filters summary */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Active Filters</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-bold text-slate-600 block mb-2">Conditions (Search OR)</span>
              <div className="flex flex-wrap gap-2">
                {profile.conditions.map((c: string) => (
                  <span key={c} className="text-sm font-medium text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {fetchError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
            <p>{fetchError}</p>
          </div>
        ) : studies.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center print:hidden">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-1">No trials found</h3>
            <p className="text-sm text-gray-500">Try broadening your condition filters or adding more status options.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:block print:space-y-4">
            {studies.map((study: CTStudy, idx: number) => (
              <TrialCard
                key={study.protocolSection?.identificationModule?.nctId || idx}
                study={study}
                isBookmarkedInitial={bookmarkedSet.has(study.protocolSection?.identificationModule?.nctId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
