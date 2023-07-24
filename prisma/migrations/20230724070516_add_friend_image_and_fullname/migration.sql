-- AlterTable
ALTER TABLE `friendship` ADD COLUMN `friend_avatar` VARCHAR(191) NULL,
    ADD COLUMN `friend_fullName` VARCHAR(191) NULL,
    ADD COLUMN `user_avatar` VARCHAR(191) NULL,
    ADD COLUMN `user_fullName` VARCHAR(191) NULL;
