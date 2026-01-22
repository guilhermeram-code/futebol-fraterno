CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`organizerName` varchar(255),
	`organizerEmail` varchar(320) NOT NULL,
	`organizerPhone` varchar(20),
	`logoUrl` text,
	`musicUrl` text,
	`backgroundUrl` text,
	`heroBackgroundUrl` text,
	`subtitle` varchar(255),
	`tournamentType` enum('groups_only','knockout_only','groups_and_knockout') DEFAULT 'groups_and_knockout',
	`teamsPerGroupAdvancing` int DEFAULT 2,
	`knockoutSize` int DEFAULT 4,
	`isActive` boolean NOT NULL DEFAULT true,
	`isDemo` boolean NOT NULL DEFAULT false,
	`purchaseId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaigns_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountPercent` int NOT NULL,
	`maxUses` int,
	`usedCount` int DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(20),
	`campaignName` varchar(255) NOT NULL,
	`campaignSlug` varchar(100) NOT NULL,
	`planType` enum('2_months','3_months','6_months','1_year') NOT NULL,
	`amountPaid` int NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`couponCode` varchar(50),
	`discountAmount` int DEFAULT 0,
	`stripeSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`status` enum('pending','completed','failed','refunded','expired') DEFAULT 'pending',
	`renewalEmailSent` boolean DEFAULT false,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchases_campaignSlug_unique` UNIQUE(`campaignSlug`)
);
--> statement-breakpoint
CREATE TABLE `reserved_slugs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`purchaseId` int,
	`reason` enum('purchased','reserved','blocked') DEFAULT 'reserved',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reserved_slugs_id` PRIMARY KEY(`id`),
	CONSTRAINT `reserved_slugs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `admin_emails` DROP INDEX `admin_emails_email_unique`;--> statement-breakpoint
ALTER TABLE `admin_users` DROP INDEX `admin_users_username_unique`;--> statement-breakpoint
ALTER TABLE `tournament_settings` DROP INDEX `tournament_settings_key_unique`;--> statement-breakpoint
ALTER TABLE `admin_emails` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `announcements` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `cards` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `comments` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `goals` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `groups` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `sponsors` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `support_messages` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `teams` ADD `campaignId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `tournament_settings` ADD `campaignId` int;