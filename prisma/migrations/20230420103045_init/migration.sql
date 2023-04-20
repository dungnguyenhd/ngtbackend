/*
  Warnings:

  - You are about to alter the column `type` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - You are about to alter the column `status` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.
  - You are about to alter the column `level` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.

*/

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `user_id_social` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `level` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `last_login` DATETIME(3) NULL,
    `last_logout` DATETIME(3) NULL,
    `current_used_product` INTEGER NULL,
    `has_password` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `user_user_name_key`(`user_name`),
    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
