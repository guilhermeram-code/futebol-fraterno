CREATE TABLE `trial_signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`whatsapp` varchar(20),
	`campaignName` varchar(255) NOT NULL,
	`campaignSlug` varchar(100) NOT NULL,
	`campaignId` int,
	`status` enum('active','expired','converted') DEFAULT 'active',
	`plainPassword` varchar(50),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trial_signups_id` PRIMARY KEY(`id`),
	CONSTRAINT `trial_signups_email_unique` UNIQUE(`email`),
	CONSTRAINT `trial_signups_campaignSlug_unique` UNIQUE(`campaignSlug`)
);
--> statement-breakpoint
ALTER TABLE `purchases` ADD `isTrial` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `purchases` ADD `trialSignupId` int;