/*
  Warnings:

  - You are about to drop the column `image` on the `server` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `server` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `server` table. All the data in the column will be lost.
  - Added the required column `server_name` to the `server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `server` DROP COLUMN `image`,
    DROP COLUMN `message`,
    DROP COLUMN `user_id`,
    ADD COLUMN `server_avatar` LONGTEXT NULL,
    ADD COLUMN `server_name` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `server_messenger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `server_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `message` LONGTEXT NULL,
    `image` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `server_messenger` ADD CONSTRAINT `server_messenger_server_id_fkey` FOREIGN KEY (`server_id`) REFERENCES `server`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
