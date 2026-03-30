import { drizzle } from 'drizzle-orm/d1';
import { getRequestContext } from '@cloudflare/next-on-pages';
import * as schema from './schema';

export function getDb() {
  const env = getRequestContext().env as any;
  if (!env || !env.DB) {
    throw new Error('Cloudflare D1 binding not found. Ensure you are running within the Pages Edge Runtime or Wrangler preview.');
  }
  return drizzle(env.DB, { schema });
}
