-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "MedicalNote" (
    "id" TEXT NOT NULL,
    "patientDni" INTEGER NOT NULL,
    "doctorLicense" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalNote_patientDni_idx" ON "MedicalNote"("patientDni");

-- CreateIndex
CREATE INDEX "MedicalNote_doctorLicense_idx" ON "MedicalNote"("doctorLicense");

-- AddForeignKey
ALTER TABLE "MedicalNote" ADD CONSTRAINT "MedicalNote_patientDni_fkey" FOREIGN KEY ("patientDni") REFERENCES "Patient"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalNote" ADD CONSTRAINT "MedicalNote_doctorLicense_fkey" FOREIGN KEY ("doctorLicense") REFERENCES "Doctor"("licenseNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
