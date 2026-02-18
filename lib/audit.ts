// Mengimpor prisma untuk koneksi ke database
import prisma from "@/lib/prisma";

// Tipe data untuk input saat membuat audit log
type AuditInput = {
  pengajuanId: number;
  userId?: number | null;
  action: string;
  detail?: string | null;
};

// Fungsi untuk membuat log audit baru di database
export async function createAuditLog({ pengajuanId, userId, action, detail }: AuditInput) {
  return prisma.auditLog.create({
    data: {
      pengajuan: { connect: { id: pengajuanId } },              // Menghubungkan dengan pengajuan berdasarkan ID
      user: userId ? { connect: { id: userId } } : undefined,  // Menghubungkan dengan user jika ada ID user
      action,                                                 // Aksi yang dilakukan
       detail: detail ?? null,                               // Detail tambahan, jika ada 
    },
  });
}
