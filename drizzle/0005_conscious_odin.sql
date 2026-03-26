ALTER TABLE `documents` ADD `titleEs` varchar(500);--> statement-breakpoint
ALTER TABLE `documents` ADD `summaryEs` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `contentEs` text;--> statement-breakpoint
ALTER TABLE `special_cases` ADD `titleEs` varchar(500);--> statement-breakpoint
ALTER TABLE `special_cases` ADD `descriptionEs` text;--> statement-breakpoint
ALTER TABLE `special_cases` ADD `legalBasisEs` text;--> statement-breakpoint
ALTER TABLE `special_cases` ADD `procedureEs` text;--> statement-breakpoint
ALTER TABLE `special_cases` ADD `examplesEs` text;