CREATE TABLE `alert_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`frequency` text DEFAULT 'daily' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`conditions` text NOT NULL,
	`statuses` text NOT NULL,
	`country` text NOT NULL,
	`phases` text,
	`sponsor_types` text,
	`last_synced_at` integer
);
--> statement-breakpoint
CREATE TABLE `digest_log` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`new_trials_count` integer NOT NULL,
	`changed_trials_count` integer NOT NULL,
	`email_sent_to` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trial_bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`nct_id` text NOT NULL,
	`study_data` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trial_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`nct_id` text NOT NULL,
	`status_at_snapshot` text NOT NULL,
	`snapshot_date` integer NOT NULL,
	`study_data` text NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `alert_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
