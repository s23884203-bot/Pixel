CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discordMessageId` varchar(64) NOT NULL,
	`discordUserId` varchar(64) NOT NULL,
	`authorName` varchar(255) NOT NULL,
	`authorAvatar` text,
	`content` text NOT NULL,
	`rating` int DEFAULT 5,
	`timestamp` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_discordMessageId_unique` UNIQUE(`discordMessageId`)
);
