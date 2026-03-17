ALTER TABLE `documents` ADD `publicationYear` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `status` enum('vigent','derogada','en_revisio') DEFAULT 'vigent' NOT NULL;--> statement-breakpoint
CREATE INDEX `status_idx` ON `documents` (`status`);--> statement-breakpoint
CREATE INDEX `year_idx` ON `documents` (`publicationYear`);