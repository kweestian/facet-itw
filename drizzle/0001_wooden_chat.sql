CREATE TABLE `audit_trail` (
	`id` text PRIMARY KEY NOT NULL,
	`agreement_id` text NOT NULL,
	`step` text NOT NULL,
	`step_order` integer NOT NULL,
	`rule_id` text,
	`action` text NOT NULL,
	`input` text,
	`output` text,
	`reasoning` text,
	`extracted_data` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`agreement_id`) REFERENCES `agreement`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rule_id`) REFERENCES `policy_rule`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `audit_trail_agreement_id_idx` ON `audit_trail` (`agreement_id`);--> statement-breakpoint
CREATE INDEX `audit_trail_step_order_idx` ON `audit_trail` (`step_order`);--> statement-breakpoint
CREATE INDEX `audit_trail_rule_id_idx` ON `audit_trail` (`rule_id`);