// Pre-populated condition tags for stroke center — easily extensible
export const STROKE_CONDITIONS = [
  // Core stroke
  { id: 'stroke', label: 'Stroke', query: 'stroke' },
  { id: 'ischemic_stroke', label: 'Ischemic Stroke', query: 'ischemic stroke' },
  { id: 'tia', label: 'TIA', query: 'transient ischemic attack TIA' },
  { id: 'ich', label: 'ICH', query: 'intracerebral hemorrhage ICH' },
  { id: 'sah', label: 'SAH', query: 'subarachnoid hemorrhage SAH' },
  { id: 'lacunar', label: 'Lacunar Stroke', query: 'lacunar stroke' },
  // Cardiac
  { id: 'afib', label: 'Atrial Fibrillation', query: 'atrial fibrillation' },
  { id: 'pfo', label: 'Patent Foramen Ovale', query: 'patent foramen ovale PFO' },
  { id: 'cvd', label: 'Cardiovascular Disease', query: 'cardiovascular disease' },
  { id: 'heart_failure', label: 'Heart Failure', query: 'heart failure' },
  // Metabolic
  { id: 'cholesterol', label: 'Cholesterol', query: 'hypercholesterolemia dyslipidemia cholesterol' },
  { id: 'hypertension', label: 'Hypertension', query: 'hypertension high blood pressure' },
  { id: 'diabetes', label: 'Diabetes', query: 'diabetes' },
  // Rehab & Recovery
  { id: 'rehab', label: 'Stroke Rehabilitation', query: 'stroke rehabilitation recovery' },
  { id: 'aphasia', label: 'Aphasia', query: 'aphasia' },
  { id: 'motor', label: 'Motor Recovery', query: 'motor function rehabilitation stroke' },
  // Prevention
  { id: 'prevention', label: 'Secondary Prevention', query: 'secondary stroke prevention' },
  { id: 'anticoag', label: 'Anticoagulation', query: 'anticoagulation stroke' },
]

export const TRIAL_STATUSES = [
  { id: 'RECRUITING', label: 'Recruiting', description: 'Currently enrolling patients' },
  { id: 'NOT_YET_RECRUITING', label: 'Not Yet Recruiting', description: 'Approved but not yet open — looking for sites now' },
  { id: 'ENROLLING_BY_INVITATION', label: 'Enrolling by Invitation', description: 'Open to specific sites' },
]

export const TRIAL_PHASES = [
  { id: 'PHASE1', label: 'Phase 1' },
  { id: 'PHASE2', label: 'Phase 2' },
  { id: 'PHASE3', label: 'Phase 3' },
  { id: 'PHASE4', label: 'Phase 4' },
]

export const SPONSOR_TYPES = [
  { id: 'INDUSTRY', label: 'Industry / Pharma' },
  { id: 'NIH', label: 'NIH' },
  { id: 'OTHER_GOV', label: 'Other Government' },
  { id: 'OTHER', label: 'Academic / Other' },
]

export const STATUS_COLORS: Record<string, string> = {
  RECRUITING: 'bg-green-100 text-green-800 border-green-200',
  NOT_YET_RECRUITING: 'bg-blue-100 text-blue-800 border-blue-200',
  ENROLLING_BY_INVITATION: 'bg-purple-100 text-purple-800 border-purple-200',
  ACTIVE_NOT_RECRUITING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  COMPLETED: 'bg-gray-100 text-gray-600 border-gray-200',
  TERMINATED: 'bg-red-100 text-red-800 border-red-200',
}

export const PHASE_LABELS: Record<string, string> = {
  PHASE1: 'Phase 1',
  PHASE2: 'Phase 2',
  PHASE3: 'Phase 3',
  PHASE4: 'Phase 4',
  NA: 'N/A',
}
