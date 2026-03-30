'use client'

import { useState, useTransition } from 'react'
import { CTStudy, getTitle, getNctId, getStatus, getSponsor, getPhases, getEnrollment, getUSLocations, getContact, getLastUpdated, getConditions, getCtGovUrl, formatStatus, getEligibilityCriteria, getPrimaryOutcomes } from '@/lib/clinicaltrials'
import { STATUS_COLORS, PHASE_LABELS } from '@/lib/constants'
import { format, parseISO } from 'date-fns'
import { toggleBookmark } from '@/app/actions/bookmarks'

interface TrialCardProps {
  study: CTStudy
  isNew?: boolean
  isBookmarkedInitial?: boolean
}

export default function TrialCard({ study, isNew, isBookmarkedInitial = false }: TrialCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitial)
  const [isPending, startTransition] = useTransition()

  const nctId = getNctId(study)
  const title = getTitle(study)
  const status = getStatus(study)
  const sponsor = getSponsor(study)
  const phases = getPhases(study)
  const enrollment = getEnrollment(study)
  const usLocations = getUSLocations(study)
  const contact = getContact(study)
  const lastUpdated = getLastUpdated(study)
  const conditions = getConditions(study)
  const criteria = getEligibilityCriteria(study)
  const outcomes = getPrimaryOutcomes(study)
  const ctUrl = getCtGovUrl(nctId)

  const statusClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600 border-gray-200'

  const handleBookmark = () => {
    const newValue = !isBookmarked
    setIsBookmarked(newValue)
    startTransition(async () => {
      try {
        const result = await toggleBookmark(nctId, study)
        setIsBookmarked(result.bookmarked)
      } catch (err) {
        setIsBookmarked(!newValue)
      }
    })
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-300 shadow-sm p-6 hover:border-indigo-400 transition-colors print:shadow-none print:break-inside-avoid print:border-slate-400 ${isNew ? 'border-l-8 border-l-emerald-500' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          {isNew && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold tracking-wide text-emerald-800 bg-emerald-100 px-3 py-1 rounded-sm mb-2 uppercase">
              <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
              Newly Added
            </span>
          )}
          <h3 className="font-bold text-slate-900 text-lg leading-snug">
            {title}
          </h3>
          <div className="text-base text-slate-700 font-medium mt-2 flex items-center justify-between">
            <span>Sponsor: <span className="text-slate-900">{sponsor}</span></span>
            <button 
              onClick={handleBookmark}
              disabled={isPending}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors border ${
                isBookmarked 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <svg className={`w-4 h-4 ${isBookmarked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isBookmarked ? 1.5 : 2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {isBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mb-5 border-y border-slate-100 py-3">
        <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded">
          {nctId}
        </span>
        <span className={`text-sm font-bold px-3 py-1 rounded border ${statusClass}`}>
          {formatStatus(status)}
        </span>
        {phases.map(p => (
          <span key={p} className="text-sm font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded">
            {PHASE_LABELS[p] || p}
          </span>
        ))}
        {enrollment && (
          <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded">
            Enrollment: {enrollment.toLocaleString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        {/* Conditions */}
        {conditions.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Conditions Studied</h4>
            <div className="flex flex-wrap gap-1.5">
              {conditions.slice(0, 5).map(c => (
                <span key={c} className="text-sm font-medium text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                  {c}
                </span>
              ))}
              {conditions.length > 5 && (
                <span className="text-sm font-medium text-slate-500 px-1 py-1">+{conditions.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {/* US Sites */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">US Site Status</h4>
          <div className="flex flex-col gap-1.5 text-base text-slate-800 font-medium">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{usLocations.length} US Sites Identified</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Last Updated: {format(parseISO(lastUpdated), 'MMMM d, yyyy')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact */}
      {contact && (contact.email || contact.phone) && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4 text-base text-slate-800 font-medium">
          <span className="font-bold text-indigo-900 block mb-1">Lead Contact Information</span>
          {contact.name && <span className="mr-3">{contact.name}</span>}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-indigo-700 hover:text-indigo-900 hover:underline mr-3 font-semibold">
              {contact.email}
            </a>
          )}
          {contact.phone && <span className="text-slate-600">{contact.phone}</span>}
        </div>
      )}

      {/* Expansion Panel */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-8">
            {outcomes.length > 0 && (
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Primary Outcomes
                </h4>
                <ul className="space-y-4">
                  {outcomes.map((outcome, idx) => (
                    <li key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="font-bold text-slate-900 text-sm mb-1">{outcome.measure}</div>
                      {outcome.description && <p className="text-sm text-slate-700 mt-1">{outcome.description}</p>}
                      {outcome.timeFrame && <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-3 flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{outcome.timeFrame}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {criteria && (
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Eligibility Criteria
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium font-mono">
                    {criteria}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA Footer */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
        <a
          href={ctUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-indigo-900 hover:underline"
        >
          Read Full Protocol on ClinicalTrials.gov
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        
        {(criteria || outcomes.length > 0) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Expand Details'}
            <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
