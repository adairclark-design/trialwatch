// ClinicalTrials.gov REST API v2 integration
// Docs: https://clinicaltrials.gov/data-api/api

export interface CTStudy {
  protocolSection: {
    identificationModule: {
      nctId: string
      briefTitle: string
      officialTitle?: string
    }
    statusModule: {
      overallStatus: string
      startDateStruct?: { date: string }
      primaryCompletionDateStruct?: { date: string }
      lastUpdatePostDateStruct?: { date: string }
    }
    sponsorCollaboratorsModule: {
      leadSponsor: {
        name: string
        class: string // 'INDUSTRY' | 'NIH' | 'FED' | 'INDIV' | 'NETWORK' | 'AMBIG' | 'OTHER_GOV' | 'UNKNOWN' | 'OTHER'
      }
    }
    descriptionModule?: {
      briefSummary?: string
    }
    conditionsModule?: {
      conditions?: string[]
      keywords?: string[]
    }
    designModule?: {
      phases?: string[]
      enrollmentInfo?: {
        count?: number
        type?: string
      }
    }
    contactsLocationsModule?: {
      centralContacts?: Array<{
        name?: string
        role?: string
        phone?: string
        email?: string
      }>
      locations?: Array<{
        facility?: string
        city?: string
        state?: string
        country?: string
        status?: string
      }>
    }
    eligibilityModule?: {
      eligibilityCriteria?: string
      minimumAge?: string
      maximumAge?: string
      sex?: string
    }
    outcomesModule?: {
      primaryOutcomes?: Array<{
        measure: string
        description?: string
        timeFrame?: string
      }>
    }
  }
}

export interface CTSearchResponse {
  studies: CTStudy[]
  nextPageToken?: string
  totalCount?: number
}

export interface SearchParams {
  conditions: string[]
  statuses: string[]
  country?: string
  phases?: string[]
  sponsorTypes?: string[]
  pageToken?: string
  pageSize?: number
}

const CT_API_BASE = 'https://clinicaltrials.gov/api/v2'

const FIELDS = [
  'NCTId',
  'BriefTitle',
  'OfficialTitle',
  'OverallStatus',
  'StartDate',
  'PrimaryCompletionDate',
  'LastUpdatePostDate',
  'LeadSponsorName',
  'LeadSponsorClass',
  'BriefSummary',
  'Condition',
  'Keyword',
  'Phase',
  'EnrollmentCount',
  'CentralContactName',
  'CentralContactPhone',
  'CentralContactEMail',
  'LocationFacility',
  'LocationCity',
  'LocationState',
  'LocationCountry',
  'LocationStatus',
  'PrimaryOutcomeMeasure',
  'EligibilityCriteria',
  'MinimumAge',
  'MaximumAge',
].join(',')

export async function searchTrials(params: SearchParams): Promise<CTSearchResponse> {
  const url = new URL(`${CT_API_BASE}/studies`)

  // Condition query — joins with OR
  if (params.conditions.length > 0) {
    url.searchParams.set('query.cond', params.conditions.join(' OR '))
  }

  // Status filter
  if (params.statuses.length > 0) {
    url.searchParams.set('filter.overallStatus', params.statuses.join(','))
  }

  // Country filter
  const country = params.country || 'United States'
  url.searchParams.set('query.locn', country)

  // Phase filter (optional)
  if (params.phases && params.phases.length > 0) {
    url.searchParams.set('filter.phase', params.phases.join(','))
  }

  // Sponsor type filter (optional)
  if (params.sponsorTypes && params.sponsorTypes.length > 0) {
    url.searchParams.set('filter.sponsorClass', params.sponsorTypes.join(','))
  }

  // Pagination
  url.searchParams.set('pageSize', String(params.pageSize || 100))
  if (params.pageToken) {
    url.searchParams.set('pageToken', params.pageToken)
  }

  // Fields
  url.searchParams.set('fields', FIELDS)

  // Sort by last updated descending (newest changes first)
  url.searchParams.set('sort', 'LastUpdatePostDate:desc')

  const resp = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 }, // Cache 1 hour in Next.js
  })

  if (!resp.ok) {
    throw new Error(`ClinicalTrials.gov API error: ${resp.status} ${resp.statusText}`)
  }

  return resp.json()
}

export async function searchAllTrials(params: SearchParams, maxResults = 300): Promise<CTStudy[]> {
  const allStudies: CTStudy[] = []
  let pageToken: string | undefined = undefined

  do {
    const response = await searchTrials({ ...params, pageToken })
    allStudies.push(...(response.studies || []))
    pageToken = response.nextPageToken
    
    // Safety cap to prevent massive memory leaks on generic queries
    if (allStudies.length >= maxResults) {
      break
    }
  } while (pageToken)

  // Trim to exact maxResults in case the last page overshot it
  return allStudies.slice(0, maxResults)
}

export function getNctId(study: CTStudy): string {
  return study.protocolSection.identificationModule.nctId
}

export function getTitle(study: CTStudy): string {
  return study.protocolSection.identificationModule.briefTitle
}

export function getStatus(study: CTStudy): string {
  return study.protocolSection.statusModule.overallStatus
}

export function getSponsor(study: CTStudy): string {
  return study.protocolSection.sponsorCollaboratorsModule.leadSponsor.name
}

export function getPhases(study: CTStudy): string[] {
  return study.protocolSection.designModule?.phases || []
}

export function getEnrollment(study: CTStudy): number | null {
  return study.protocolSection.designModule?.enrollmentInfo?.count || null
}

export function getUSLocations(study: CTStudy): Array<{ facility?: string; city?: string; state?: string; status?: string }> {
  const locations = study.protocolSection.contactsLocationsModule?.locations || []
  return locations.filter(l => l.country === 'United States')
}

export function getContact(study: CTStudy): { name?: string; email?: string; phone?: string } | null {
  const contacts = study.protocolSection.contactsLocationsModule?.centralContacts || []
  return contacts[0] || null
}

export function getLastUpdated(study: CTStudy): string | null {
  return study.protocolSection.statusModule.lastUpdatePostDateStruct?.date || null
}

export function getConditions(study: CTStudy): string[] {
  return study.protocolSection.conditionsModule?.conditions || []
}

export function getCtGovUrl(nctId: string): string {
  return `https://clinicaltrials.gov/study/${nctId}`
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    RECRUITING: 'Recruiting',
    NOT_YET_RECRUITING: 'Not Yet Recruiting',
    ENROLLING_BY_INVITATION: 'Enrolling by Invitation',
    ACTIVE_NOT_RECRUITING: 'Active, Not Recruiting',
    COMPLETED: 'Completed',
    TERMINATED: 'Terminated',
    WITHDRAWN: 'Withdrawn',
    SUSPENDED: 'Suspended',
  }
  return map[status] || status
}

export function getEligibilityCriteria(study: CTStudy): string | null {
  return study.protocolSection.eligibilityModule?.eligibilityCriteria || null
}

export function getPrimaryOutcomes(study: CTStudy): Array<{ measure: string; description?: string; timeFrame?: string }> {
  return study.protocolSection.outcomesModule?.primaryOutcomes || []
}
