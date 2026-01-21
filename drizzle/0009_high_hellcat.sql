CREATE TABLE `support_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`authorName` varchar(255) NOT NULL,
	`authorLodge` varchar(255),
	`message` text NOT NULL,
	`approved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_messages_id` PRIMARY KEY(`id`)
);
