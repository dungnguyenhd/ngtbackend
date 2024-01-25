/*
  Warnings:

  - Added the required column `game_played` to the `user_dashboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user_dashboard` ADD COLUMN `game_played` INTEGER NOT NULL;
