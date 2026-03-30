import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import * as schema from './schema';

export async function getDb() {
  const { env } = await getCloudflareContext();
  const db_env = env as any;
  if (!db_env || !db_env.DB) {
    throw new Error('Cloudflare D1 binding (DB) not found. Ensure it is set in the Cloudflare Pages dashboard Settings > Bindings.');
  }
  return drizzle(db_env.DB, { schema });
}
