CREATE TABLE `media_blobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mediaId` int NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`base64Data` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_blobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_blobs_mediaId_unique` UNIQUE(`mediaId`)
);
