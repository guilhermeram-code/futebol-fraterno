ALTER TABLE `goals` MODIFY COLUMN `playerId` int;--> statement-breakpoint
ALTER TABLE `goals` ADD `isOwnGoal` boolean DEFAULT false NOT NULL;