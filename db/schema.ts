import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const alertProfiles = sqliteTable('alert_profiles', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  frequency: text('frequency').default('daily').notNull(),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  conditions: text('conditions', { mode: 'json' }).$type<string[]>().notNull(),
  statuses: text('statuses', { mode: 'json' }).$type<string[]>().notNull(),
  country: text('country').notNull(),
  phases: text('phases', { mode: 'json' }).$type<string[] | null>(),
  sponsor_types: text('sponsor_types', { mode: 'json' }).$type<string[] | null>(),
  last_synced_at: integer('last_synced_at', { mode: 'timestamp' }),
});

export const trialSnapshots = sqliteTable('trial_snapshots', {
  id: text('id').primaryKey(),
  profile_id: text('profile_id').notNull().references(() => alertProfiles.id),
  nct_id: text('nct_id').notNull(),
  status_at_snapshot: text('status_at_snapshot').notNull(),
  snapshot_date: integer('snapshot_date', { mode: 'timestamp' }).notNull(),
  study_data: text('study_data', { mode: 'json' }).notNull(),
});

export const trialBookmarks = sqliteTable('trial_bookmarks', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  nct_id: text('nct_id').notNull(),
  study_data: text('study_data', { mode: 'json' }).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const digestLog = sqliteTable('digest_log', {
  id: text('id').primaryKey(),
  profile_id: text('profile_id').notNull(),
  new_trials_count: integer('new_trials_count').notNull(),
  changed_trials_count: integer('changed_trials_count').notNull(),
  email_sent_to: text('email_sent_to').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});
