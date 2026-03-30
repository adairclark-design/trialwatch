import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    const ctx = getRequestContext()
    const env = ctx.env as any
    const hasDb = !!(env && env.DB)
    return NextResponse.json({ 
      ok: true, 
      hasDb,
      envKeys: env ? Object.keys(env) : [],
      message: hasDb ? 'D1 binding found' : 'D1 binding MISSING'
    })
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false,
      error: e.message || String(e),
      stack: e.stack
    }, { status: 200 }) // 200 so we can read the body
  }
}
