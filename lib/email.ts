import { CTStudy, getTitle, getNctId, getStatus, getSponsor, getPhases, getEnrollment, getUSLocations, getContact, getCtGovUrl, formatStatus } from '@/lib/clinicaltrials'
import { AlertProfile } from '@/lib/database.types'
import { PHASE_LABELS } from '@/lib/constants'

export function generateDigestHtml(
  profile: AlertProfile,
  newTrials: CTStudy[],
  changedTrials: Array<{ study: CTStudy; oldStatus: string; newStatus: string }>
): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  function trialBlock(study: CTStudy, badgeText?: string, badgeColor?: string): string {
    const nctId = getNctId(study)
    const contact = getContact(study)
    const usLocations = getUSLocations(study)
    const phases = getPhases(study).map(p => PHASE_LABELS[p] || p).join(', ')
    const enrollment = getEnrollment(study)

    return `
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px;border-left:4px solid ${badgeColor || '#6366f1'}">
        ${badgeText ? `<div style="display:inline-block;background:${badgeColor || '#6366f1'};color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;margin-bottom:10px;">${badgeText}</div>` : ''}
        <h3 style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1e293b;line-height:1.4">${getTitle(study)}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">
          <span style="background:#f1f5f9;color:#64748b;font-size:11px;padding:3px 8px;border-radius:4px">${nctId}</span>
          ${phases ? `<span style="background:#eef2ff;color:#4f46e5;font-size:11px;padding:3px 8px;border-radius:4px">${phases}</span>` : ''}
          ${enrollment ? `<span style="background:#f1f5f9;color:#64748b;font-size:11px;padding:3px 8px;border-radius:4px">N=${enrollment.toLocaleString()}</span>` : ''}
          <span style="background:#dcfce7;color:#166534;font-size:11px;padding:3px 8px;border-radius:4px">${formatStatus(getStatus(study))}</span>
        </div>
        <div style="font-size:13px;color:#475569;margin-bottom:8px"><strong>Sponsor:</strong> ${getSponsor(study)}</div>
        <div style="font-size:13px;color:#475569;margin-bottom:10px">📍 <strong>${usLocations.length} US ${usLocations.length === 1 ? 'site' : 'sites'}</strong></div>
        ${contact && (contact.email || contact.phone) ? `
          <div style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:12px;font-size:13px;color:#475569">
            <strong>Contact:</strong> ${contact.name || ''} ${contact.email ? `<a href="mailto:${contact.email}" style="color:#4f46e5">${contact.email}</a>` : ''} ${contact.phone || ''}
          </div>
        ` : ''}
        <a href="${getCtGovUrl(nctId)}" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:8px 18px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">
          View on ClinicalTrials.gov →
        </a>
      </div>
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px">

        <!-- Header -->
        <div style="text-align:center;margin-bottom:32px">
          <div style="display:inline-flex;align-items:center;gap:8px;background:#4f46e5;color:#fff;padding:8px 18px;border-radius:20px;font-size:14px;font-weight:600;margin-bottom:16px">
            📋 TrialWatch Daily Digest
          </div>
          <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#1e293b">${profile.name}</h1>
          <p style="margin:0;font-size:14px;color:#64748b">${today}</p>
        </div>

        <!-- Summary banner -->
        <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;gap:24px">
          <div style="text-align:center">
            <div style="font-size:28px;font-weight:700;color:#4f46e5">${newTrials.length}</div>
            <div style="font-size:12px;color:#6366f1;font-weight:600">NEW TRIALS</div>
          </div>
          <div style="border-left:1px solid #c7d2fe;margin:4px 0"></div>
          <div style="text-align:center">
            <div style="font-size:28px;font-weight:700;color:#7c3aed">${changedTrials.length}</div>
            <div style="font-size:12px;color:#7c3aed;font-weight:600">STATUS CHANGED</div>
          </div>
        </div>

        ${newTrials.length > 0 ? `
          <h2 style="font-size:16px;font-weight:700;color:#1e293b;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">
            🆕 New Since Yesterday (${newTrials.length})
          </h2>
          ${newTrials.map(s => trialBlock(s, 'NEW', '#10b981')).join('')}
        ` : ''}

        ${changedTrials.length > 0 ? `
          <h2 style="font-size:16px;font-weight:700;color:#1e293b;margin:24px 0 12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">
            🔄 Status Changed (${changedTrials.length})
          </h2>
          ${changedTrials.map(({ study, oldStatus, newStatus }) =>
            trialBlock(study, `${formatStatus(oldStatus)} → ${formatStatus(newStatus)}`, '#7c3aed')
          ).join('')}
        ` : ''}

        <!-- Footer -->
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8">
          <p style="margin:0 0 6px">Data sourced from <a href="https://clinicaltrials.gov" style="color:#4f46e5">ClinicalTrials.gov</a> — NIH National Library of Medicine</p>
          <p style="margin:0">TrialWatch delivers your digest every day at 7:00 AM.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
