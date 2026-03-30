export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// STUB: No DB imports at all - just to test if basic Edge rendering works
export default async function DashboardPage() {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ Edge Worker is ALIVE</h1>
      <p>If you see this, the basic Cloudflare Edge runtime is working correctly.</p>
      <p>The next step is to add the D1 database connection.</p>
      <a href="/api/health" style={{ color: 'blue', textDecoration: 'underline' }}>
        Click here to check D1 binding status →
      </a>
    </div>
  )
}
