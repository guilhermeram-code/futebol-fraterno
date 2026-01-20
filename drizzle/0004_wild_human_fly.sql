CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`password` varchar(255) NOT NULL,
	`name` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastLogin` timestamp,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `comments` ADD `approved` boolean DEFAULT false NOT NULL;