-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STAF', 'KEPALA_LAB', 'WADEK', 'DEKAN', 'ADMIN_SERVER');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('DIAJUKAN', 'DIPERIKSA', 'DISETUJUI', 'DITANGGUHKAN', 'DIPROSES', 'DISELESAIKAN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "noTelepon" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengajuanServer" (
    "id" SERIAL NOT NULL,
    "namaSistem" TEXT NOT NULL,
    "pemilikSistem" TEXT NOT NULL,
    "penggunaSistem" TEXT NOT NULL,
    "fungsiSistem" TEXT NOT NULL,
    "aksesPublik" BOOLEAN NOT NULL,
    "namaAlamatLayanan" TEXT,
    "kebutuhanCPU" INTEGER NOT NULL,
    "kebutuhanRAM" INTEGER NOT NULL,
    "kebutuhanStorage" INTEGER NOT NULL,
    "sistemOperasi" TEXT NOT NULL,
    "softwareTambahan" TEXT,
    "status" "StatusPengajuan" NOT NULL,
    "tanggalPengajuan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pemohonId" INTEGER NOT NULL,

    CONSTRAINT "PengajuanServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persetujuan" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "catatan" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pengajuanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Persetujuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TindakLanjutServer" (
    "id" SERIAL NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "pengajuanId" INTEGER NOT NULL,

    CONSTRAINT "TindakLanjutServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PenerimaanServer" (
    "id" SERIAL NOT NULL,
    "cpu" INTEGER NOT NULL,
    "ram" INTEGER NOT NULL,
    "storage" INTEGER NOT NULL,
    "sistemOperasi" TEXT NOT NULL,
    "softwareTambahan" TEXT,
    "tanggalDiterima" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pengajuanId" INTEGER NOT NULL,

    CONSTRAINT "PenerimaanServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArsipLayanan" (
    "id" SERIAL NOT NULL,
    "catatan" TEXT,
    "tanggalArsip" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pengajuanId" INTEGER NOT NULL,

    CONSTRAINT "ArsipLayanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupLayanan" (
    "id" SERIAL NOT NULL,
    "periodeBackup" TEXT NOT NULL,
    "tanggalTerakhir" TIMESTAMP(3),
    "pengajuanId" INTEGER NOT NULL,

    CONSTRAINT "BackupLayanan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TindakLanjutServer_pengajuanId_key" ON "TindakLanjutServer"("pengajuanId");

-- CreateIndex
CREATE UNIQUE INDEX "PenerimaanServer_pengajuanId_key" ON "PenerimaanServer"("pengajuanId");

-- CreateIndex
CREATE UNIQUE INDEX "ArsipLayanan_pengajuanId_key" ON "ArsipLayanan"("pengajuanId");

-- CreateIndex
CREATE UNIQUE INDEX "BackupLayanan_pengajuanId_key" ON "BackupLayanan"("pengajuanId");

-- AddForeignKey
ALTER TABLE "PengajuanServer" ADD CONSTRAINT "PengajuanServer_pemohonId_fkey" FOREIGN KEY ("pemohonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persetujuan" ADD CONSTRAINT "Persetujuan_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persetujuan" ADD CONSTRAINT "Persetujuan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TindakLanjutServer" ADD CONSTRAINT "TindakLanjutServer_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenerimaanServer" ADD CONSTRAINT "PenerimaanServer_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArsipLayanan" ADD CONSTRAINT "ArsipLayanan_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackupLayanan" ADD CONSTRAINT "BackupLayanan_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
