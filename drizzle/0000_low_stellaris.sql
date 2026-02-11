CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`type` enum('ley','decreto','guia','manual','pildora','otro') NOT NULL,
	`source` varchar(255),
	`jurisdiction` enum('estatal','autonomica','ambas') NOT NULL DEFAULT 'estatal',
	`content` text NOT NULL,
	`summary` text,
	`url` varchar(500),
	`fileKey` varchar(500),
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `embeddings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('document','special_case') NOT NULL,
	`entityId` int NOT NULL,
	`chunkText` text NOT NULL,
	`embedding` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `embeddings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `it_durations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`diagnosis` varchar(500) NOT NULL,
	`cie10Code` varchar(20),
	`category` varchar(255),
	`minDays` int NOT NULL,
	`maxDays` int NOT NULL,
	`averageDays` int NOT NULL,
	`ageAdjustment` json,
	`occupationAdjustment` json,
	`notes` text,
	`source` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `it_durations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`sources` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `special_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`category` enum('menstruacion','embarazo','lactancia','donacion_organos','baja_retroactiva','pluriempleo','prision','extranjeros','vacaciones','recaida','otro') NOT NULL,
	`description` text NOT NULL,
	`legalBasis` text,
	`procedure` text,
	`examples` text,
	`relatedDocumentIds` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `special_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversationId_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `special_cases` ADD CONSTRAINT `special_cases_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_idx` ON `conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `title_idx` ON `documents` (`title`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `documents` (`type`);--> statement-breakpoint
CREATE INDEX `entity_idx` ON `embeddings` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `diagnosis_idx` ON `it_durations` (`diagnosis`);--> statement-breakpoint
CREATE INDEX `cie10_idx` ON `it_durations` (`cie10Code`);--> statement-breakpoint
CREATE INDEX `conversation_idx` ON `messages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `special_cases` (`category`);