-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `type` ENUM('KAKAO', 'GOOGLE', 'ACCOUNT') NOT NULL,
    `email` VARCHAR(191) NULL,
    `user_id_social` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'DISABLE', 'UNCONFIRM', 'DELETED') NOT NULL,
    `level` ENUM('USER', 'MANAGER', 'ADMIN') NOT NULL,
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
