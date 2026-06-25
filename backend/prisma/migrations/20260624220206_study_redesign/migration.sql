/*
  Warnings:

  - You are about to drop the column `lastname` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Patient` table. All the data in the column will be lost.
  - The primary key for the `Study` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `Study` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institution` to the `Study` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performedAt` to the `Study` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibleDoctorLicense` to the `Study` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyTypeId` to the `Study` table without a default value. This is not possible if the table is not empty.
  - Made the column `fileUrl` on table `Study` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_licenseNumber_fkey";

-- DropIndex
DROP INDEX "User_licenseNumber_key";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "lastname",
DROP COLUMN "name",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "lastname",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Study" DROP CONSTRAINT "Study_pkey",
DROP COLUMN "date",
ADD COLUMN     "institution" TEXT NOT NULL,
ADD COLUMN     "performedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "responsibleDoctorLicense" INTEGER NOT NULL,
ADD COLUMN     "studyTypeId" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "fileUrl" SET NOT NULL,
ADD CONSTRAINT "Study_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Study_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "licenseNumber",
ADD COLUMN     "lastname" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "StudyType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "StudyType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyType_name_key" ON "StudyType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Study" ADD CONSTRAINT "Study_studyTypeId_fkey" FOREIGN KEY ("studyTypeId") REFERENCES "StudyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Study" ADD CONSTRAINT "Study_responsibleDoctorLicense_fkey" FOREIGN KEY ("responsibleDoctorLicense") REFERENCES "Doctor"("licenseNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
