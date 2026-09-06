-- AlterTable
ALTER TABLE `OtpVerification` ADD COLUMN `username` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `username` VARCHAR(191) NULL;
