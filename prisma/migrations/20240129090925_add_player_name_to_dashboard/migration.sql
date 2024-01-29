/*
  Warnings:

  - You are about to alter the column `score` on the `user_dashboard` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `user_dashboard` ADD COLUMN `user_name` VARCHAR(191) NOT NULL DEFAULT 'Test01',
    MODIFY `score` DOUBLE NOT NULL;
