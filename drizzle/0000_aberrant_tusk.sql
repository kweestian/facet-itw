CREATE TABLE `agreement` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`raw_text` text NOT NULL,
	`overall_risk_score` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`analyzed_at` integer
);
--> statement-breakpoint
CREATE INDEX `agreement_risk_score_idx` ON `agreement` (`overall_risk_score`);--> statement-breakpoint
CREATE INDEX `agreement_created_at_idx` ON `agreement` (`created_at`);--> statement-breakpoint
CREATE TABLE `policy_rule` (
	`id` text PRIMARY KEY NOT NULL,
	`rule_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`acceptance_criteria` text NOT NULL,
	`severity` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `policy_rule_rule_id_unique` ON `policy_rule` (`rule_id`);--> statement-breakpoint
CREATE INDEX `policy_rule_severity_idx` ON `policy_rule` (`severity`);--> statement-breakpoint
CREATE INDEX `policy_rule_is_active_idx` ON `policy_rule` (`is_active`);--> statement-breakpoint
CREATE TABLE `risk_assessment` (
	`id` text PRIMARY KEY NOT NULL,
	`agreement_id` text NOT NULL,
	`rule_id` text NOT NULL,
	`flag_color` text NOT NULL,
	`explanation` text NOT NULL,
	`evidence_text` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`agreement_id`) REFERENCES `agreement`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rule_id`) REFERENCES `policy_rule`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `risk_assessment_agreement_id_idx` ON `risk_assessment` (`agreement_id`);--> statement-breakpoint
CREATE INDEX `risk_assessment_rule_id_idx` ON `risk_assessment` (`rule_id`);--> statement-breakpoint
CREATE INDEX `risk_assessment_flag_color_idx` ON `risk_assessment` (`flag_color`);