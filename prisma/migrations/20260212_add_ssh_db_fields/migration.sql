-- CreateEnum
CREATE TYPE "JenisDatabase" AS ENUM ('MySQL', 'PostgreSQL', 'Oracle', 'MicrosoftSQLServer');

-- AlterTable
ALTER TABLE "PengajuanServer" 
ADD COLUMN     "userSSH" TEXT,
ADD COLUMN     "passwordSSH" TEXT,
ADD COLUMN     "jenisDatabase" "JenisDatabase",
ADD COLUMN     "userDatabase" TEXT,
ADD COLUMN     "passwordDatabase" TEXT;
