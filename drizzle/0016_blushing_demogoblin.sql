CREATE TABLE `email_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trialSignupId` int NOT NULL,
	`emailType` enum('day_0','day_2','day_5','day_7','day_14') NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`sentAt` timestamp,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_queue_id` PRIMARY KEY(`id`)
);
