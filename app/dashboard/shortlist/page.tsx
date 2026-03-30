import Link from 'next/link'
import { getDb } from '@/db'
import { trialBookmarks } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import TrialCard from '@/components/TrialCard'

export const dynamic = 'force-dynamic'

const DEMO_USER_ID = '85f375c0-2837-4deb-908d-a5a636952008'

export default async function ShortlistPage() {
  const db = getDb()
  const savedTrials = await db
    .select()
    .from(trialBookmarks)
    .where(eq(trialBookmarks.user_id, DEMO_USER_ID))
    .orderBy(desc(trialBookmarks.created_at))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">TrialWatch</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header Tabs */}
        <div className="border-b border-gray-200 mb-8 flex gap-8">
          <Link 
            href="/dashboard"
            className="pb-4 text-slate-500 hover:text-slate-800 font-medium text-lg border-b-2 border-transparent"
          >
            My Monitors
          </Link>
          <div className="pb-4 text-indigo-600 font-bold text-lg border-b-2 border-indigo-600">
            My Shortlist <span className="ml-2 bg-indigo-100 text-indigo-700 text-sm px-2 py-0.5 rounded-full">{savedTrials.length}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Saved Protocols</h1>
            <p className="text-lg text-slate-600 mt-2">Trials you have explicitly bookmarked for deeper review.</p>
          </div>
        </div>

        {savedTrials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
            <div className="text-5xl mb-6">📌</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your Shortlist is absolute zero</h2>
            <p className="text-slate-600 text-base max-w-sm mx-auto leading-relaxed">
              When reviewing clinical trial matches from your monitors, click "Save" to stick them here for later.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {savedTrials.map(bookmark => {
              const study = bookmark.study_data as any
              return (
                <TrialCard 
                  key={bookmark.nct_id} 
                  study={study} 
                  isBookmarkedInitial={true} 
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
