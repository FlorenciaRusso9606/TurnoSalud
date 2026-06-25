-- AlterTable: add birthDate with a temporary default for existing rows, then drop the default
ALTER TABLE "Patient" ADD COLUMN "birthDate" TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01';
ALTER TABLE "Patient" ALTER COLUMN "birthDate" DROP DEFAULT;
