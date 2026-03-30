import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">TrialWatch</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-indigo-100">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            Powered by ClinicalTrials.gov — Updated Weekly
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Never miss a trial<br />
            <span className="text-indigo-600">looking for your site</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Set your therapeutic area filters once. Every Tuesday morning, 
            get an email listing new and updated trials still recruiting US sites — 
            tailored for your research program.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/dashboard"
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Start Monitoring
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-gray-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              See a Live Demo
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: '🔔',
                title: 'Weekly Email Alerts',
                desc: 'New trials, status changes, and newly opened US sites — delivered every Tuesday.'
              },
              {
                icon: '🎯',
                title: 'Your Conditions Only',
                desc: 'Pre-loaded tags for stroke, TIA, ICH, SAH, AFib, and 15+ more. Fully customizable.'
              },
              {
                icon: '🔓',
                title: 'Free — No Vendor Contract',
                desc: 'Pulls directly from the public ClinicalTrials.gov registry. No $50k/yr subscription.'
              }
            ].map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        Data sourced from ClinicalTrials.gov — a public registry maintained by the NIH National Library of Medicine.
      </footer>
    </main>
  )
}
