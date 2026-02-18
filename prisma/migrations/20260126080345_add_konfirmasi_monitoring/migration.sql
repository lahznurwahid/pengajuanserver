-- AlterEnum
ALTER TYPE "StatusPengajuan" ADD VALUE 'DITERIMA';

-- CreateTable
CREATE TABLE "KonfirmasiLayanan" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "catatan" TEXT,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pengajuanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "KonfirmasiLayanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringLayanan" (
    "id" SERIAL NOT NULL,
    "ipAddress" TEXT,
    "host" TEXT,
    "statusMonitoring" TEXT,
    "uptime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pengajuanId" INTEGER NOT NULL,

    CONSTRAINT "MonitoringLayanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pengajuanId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KonfirmasiLayanan_pengajuanId_key" ON "KonfirmasiLayanan"("pengajuanId");

-- CreateIndex
CREATE UNIQUE INDEX "MonitoringLayanan_pengajuanId_key" ON "MonitoringLayanan"("pengajuanId");

-- AddForeignKey
ALTER TABLE "KonfirmasiLayanan" ADD CONSTRAINT "KonfirmasiLayanan_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KonfirmasiLayanan" ADD CONSTRAINT "KonfirmasiLayanan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringLayanan" ADD CONSTRAINT "MonitoringLayanan_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
