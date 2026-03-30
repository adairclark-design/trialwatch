'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAlertProfile } from './actions'
import { STROKE_CONDITIONS, TRIAL_STATUSES, TRIAL_PHASES, SPONSOR_TYPES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default function NewAlertPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('OHSU Stroke Center Monitor')
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    ['stroke', 'tia', 'ich', 'sah', 'afib', 'cholesterol', 'rehab']
  )
  const [customCondition, setCustomCondition] = useState('')
  const [customConditions, setCustomConditions] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['RECRUITING', 'NOT_YET_RECRUITING'])
  const [selectedPhases, setSelectedPhases] = useState<string[]>([])
  const [selectedSponsorTypes, setSelectedSponsorTypes] = useState<string[]>([])
  const [email, setEmail] = useState('')

  function toggleItem<T>(arr: T[], item: T, setter: (v: T[]) => void) {
    if (arr.includes(item)) setter(arr.filter(x => x !== item))
    else setter([...arr, item])
  }

  function addCustomCondition() {
    const trimmed = customCondition.trim()
    if (trimmed && !customConditions.includes(trimmed)) {
      setCustomConditions([...customConditions, trimmed])
      setCustomCondition('')
    }
  }

  async function handleAction() {
    alert('Click received! Validating and saving your alert...')
    setError('')
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setSaving(true)

    // Build the conditions list from pre-set + custom
    const presetConditionQueries = STROKE_CONDITIONS
      .filter(c => selectedConditions.includes(c.id))
      .map(c => c.query)
    const allConditions = [...presetConditionQueries, ...customConditions]

    if (allConditions.length === 0) {
      setError('Please select at least one condition.')
      setSaving(false)
      return
    }

    const payload = {
      name,
      conditions: allConditions,
      statuses: selectedStatuses,
      phases: selectedPhases.length > 0 ? selectedPhases : null,
      sponsor_types: selectedSponsorTypes.length > 0 ? selectedSponsorTypes : null,
      email,
    }

    try {
      const { error: dbError, data } = await createAlertProfile(payload)

      if (dbError) {
        setError(String(dbError))
        setSaving(false)
      } else if (data) {
        router.push(`/dashboard/results/${data.id}`)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An unexpected error occurred while saving.')
      setSaving(false)
    }
  }

  const totalConditions = selectedConditions.length + customConditions.length

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">TrialWatch</span>
          </div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">New Alert Profile</h1>
          <p className="text-gray-500 mt-1">Configure your filters and we&apos;ll email you every day at 7 AM with matching trials.</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          {/* Profile Name */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Profile Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. OHSU Stroke Center Monitor"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Conditions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-900">Therapeutic Areas / Conditions</label>
              <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                {totalConditions} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {STROKE_CONDITIONS.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleItem(selectedConditions, c.id, setSelectedConditions)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    selectedConditions.includes(c.id)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Custom condition */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Add custom condition</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCondition}
                  onChange={e => setCustomCondition(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomCondition())}
                  placeholder="e.g. CADASIL, Moyamoya disease..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addCustomCondition}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Add
                </button>
              </div>
              {customConditions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {customConditions.map(c => (
                    <span key={c} className="inline-flex items-center gap-1.5 text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded-full">
                      {c}
                      <button type="button" onClick={() => setCustomConditions(customConditions.filter(x => x !== c))} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trial Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-4">Trial Status</label>
            <div className="space-y-2.5">
              {TRIAL_STATUSES.map(s => (
                <label key={s.id} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(s.id)}
                    onChange={() => toggleItem(selectedStatuses, s.id, setSelectedStatuses)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">{s.label}</span>
                    <p className="text-xs text-gray-500">{s.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Phase (optional) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-1">Phase <span className="text-gray-400 font-normal">(optional — leave blank for all)</span></label>
            <div className="flex flex-wrap gap-2 mt-3">
              {TRIAL_PHASES.map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggleItem(selectedPhases, p.id, setSelectedPhases)}
                  className={`text-sm px-4 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedPhases.includes(p.id)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sponsor type (optional) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-1">Sponsor Type <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="flex flex-wrap gap-2 mt-3">
              {SPONSOR_TYPES.map(s => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleItem(selectedSponsorTypes, s.id, setSelectedSponsorTypes)}
                  className={`text-sm px-4 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedSponsorTypes.includes(s.id)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Daily Digest Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@ohsu.edu"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-2">Digest emails send every day at 7:00 AM. Add multiple recipients with commas.</p>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAction}
              disabled={saving}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving & loading results...' : 'Save & View Results'}
            </button>
            <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
