/*
  Warnings:

  - You are about to drop the column `email` on the `reminder` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `reminder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `reminder` DROP FOREIGN KEY `Reminder_userId_fkey`;

-- DropIndex
DROP INDEX `Reminder_userId_fkey` ON `reminder`;

-- AlterTable
ALTER TABLE `reminder` DROP COLUMN `email`,
    DROP COLUMN `phone`,
    ADD COLUMN `attachments` VARCHAR(191) NULL,
    ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isRecurring` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN `recurrence` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM') NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `timezone` VARCHAR(191) NOT NULL DEFAULT 'UTC',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#3B82F6',
    `icon` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Category_name_userId_key`(`name`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
