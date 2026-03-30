import Link from 'next/link'
import { format } from 'date-fns'
import { db } from '@/db'
import { alertProfiles } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
const DEMO_USER_ID = '85f375c0-2837-4deb-908d-a5a636952008'

export default async function DashboardPage() {
  const profiles = await db
    .select()
    .from(alertProfiles)
    .where(eq(alertProfiles.user_id, DEMO_USER_ID))
    .orderBy(desc(alertProfiles.created_at))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">TrialWatch</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Clinical Monitors</h1>
            <p className="text-lg text-slate-600 mt-2">Configure therapeutic area filters and receive daily email digests.</p>
          </div>
          <Link
            href="/dashboard/alerts/new"
            className="inline-flex items-center gap-2 bg-indigo-700 text-white px-5 py-3 rounded-xl text-base font-bold hover:bg-indigo-800 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Alert
          </Link>
        </div>

        {/* Info banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-start gap-3">
          <svg className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-indigo-800">
            <strong>Daily sync runs at 7:00 AM</strong> — pulling the latest real-time data from ClinicalTrials.gov.
            You&apos;ll receive an email with new and changed trials matching each monitor profile.
          </div>
        </div>

        {/* Profile list or empty state */}
        {!profiles || profiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
            <div className="text-5xl mb-6">🔭</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No monitors configured yet</h2>
            <p className="text-slate-600 text-base mb-8 max-w-sm mx-auto leading-relaxed">
              Create your first clinical monitor to specify the therapeutic areas you want to track.
            </p>
            <Link
              href="/dashboard/alerts/new"
              className="inline-flex items-center gap-2 bg-indigo-700 text-white px-6 py-3 rounded-xl text-base font-bold hover:bg-indigo-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Alert Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 hover:border-indigo-400 transition-colors">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
                      {profile.active ? (
                        <span className="text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-sm uppercase tracking-wide">Active</span>
                      ) : (
                        <span className="text-sm font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-sm uppercase tracking-wide">Paused</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.conditions.slice(0, 8).map((c: string) => (
                        <span key={c} className="text-sm font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded">
                          {c}
                        </span>
                      ))}
                      {profile.conditions.length > 8 && (
                        <span className="text-xs text-gray-400 px-1 py-0.5">+{profile.conditions.length - 8} more</span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium text-slate-600 mt-2">
                      <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {profile.email}</span>
                      <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> {profile.frequency} sync</span>
                      {profile.last_synced_at && (
                        <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Last synced: {format(new Date(profile.last_synced_at), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <Link
                      href={`/dashboard/results/${profile.id}`}
                      className="text-base bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      View Current Results
                    </Link>
                    <Link
                      href={`/dashboard/alerts/${profile.id}/edit`}
                      className="text-sm font-medium text-slate-500 hover:text-slate-800 underline"
                    >
                      Edit Filters
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
