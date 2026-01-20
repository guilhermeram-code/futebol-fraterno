ALTER TABLE `admin_users` DROP INDEX `admin_users_email_unique`;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `username` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `isOwner` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `admin_users` ADD CONSTRAINT `admin_users_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `admin_users` DROP COLUMN `email`;