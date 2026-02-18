import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Roles, authenticateRequest, hasRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { handleApiError, parseBody } from "@/lib/validation";
import { z } from "zod";

const persetujuanSchema = z.object({
  status: z.enum(["DISETUJUI", "DITOLAK"]),
  catatan: z.string().optional(),
  pengajuanId: z.coerce.number().int().positive(),
});

const updatePersetujuanSchema = z.object({
  status: z.enum(["DISETUJUI", "DITOLAK"]).optional(),
  catatan: z.string().optional(),
});

// GET: Melihat daftar persetujuan
export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.KEPALA_LAB, Roles.WADEK, Roles.DEKAN, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pengajuanIdParam = searchParams.get("pengajuanId");
    const pengajuanId = pengajuanIdParam ? Number(pengajuanIdParam) : null;

    const persetujuan = await prisma.persetujuan.findMany({
      where: pengajuanId ? { pengajuanId } : undefined,
      orderBy: { tanggal: "desc" },
      include: { 
        user: {
          select: { nama: true, role: true }
        }, 
        pengajuan: true 
      },
    });

    return NextResponse.json({ data: persetujuan });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Membuat persetujuan baru (Setuju/Tolak)
export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.KEPALA_LAB, Roles.WADEK, Roles.DEKAN, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await parseBody(request, persetujuanSchema);
    if (error) return error;

    const { status, catatan, pengajuanId } = data;

    // Ambil data pengajuan untuk cek status saat ini
    const pengajuan = await prisma.pengajuanServer.findUnique({
      where: { id: pengajuanId },
      include: { persetujuan: { include: { user: true } } },
    });

    if (!pengajuan) {
      return NextResponse.json({ message: "Pengajuan not found." }, { status: 404 });
    }

    // 1. Cek apakah user dengan role ini sudah pernah memberi persetujuan
    const alreadyResponded = pengajuan.persetujuan.some(p => p.user?.role === auth.role);
    if (alreadyResponded) {
      return NextResponse.json({ message: "Anda sudah memberikan persetujuan sebelumnya." }, { status: 409 });
    }

    // 2. Simpan record persetujuan
    const newPersetujuan = await prisma.persetujuan.create({
      data: {
        status,
        catatan: catatan ?? null,
        pengajuan: { connect: { id: pengajuanId } },
        user: { connect: { id: auth.userId } },
      },
    });

    // 3. LOGIKA UPDATE STATUS GLOBAL
    let nextStatus = pengajuan.status; // Default tetap

    if (status === "DITOLAK") {
      nextStatus = "DITOLAK"; // Jika ditolak siapapun, langsung ganti status jadi DITOLAK
    } else {
      // Jika DISETUJUI, tentukan tahap berikutnya berdasarkan role
      if (auth.role === Roles.KEPALA_LAB) nextStatus = "DIPERIKSA";   // Lanjut ke Wadek
      if (auth.role === Roles.WADEK) nextStatus = "DISETUJUI";        // Lanjut ke Dekan
      if (auth.role === Roles.DEKAN) nextStatus = "DIPROSES";         // Final, lanjut ke Admin Server
    }

    if (nextStatus) {
      await prisma.pengajuanServer.update({
        where: { id: pengajuanId },
        data: { 
          status: nextStatus as any // Gunakan 'as any' untuk memaksa TypeScript menerima value ini
        },
      });
    }
    
    await prisma.pengajuanServer.update({
      where: { id: pengajuanId },
      data: { status: nextStatus },
    });

    // 4. Audit Log
    await createAuditLog({
      pengajuanId,
      userId: auth.userId,
      action: "PERSETUJUAN",
      detail: `Role: ${auth.role} | Status: ${status} | Note: ${catatan || "-"}`,
    });

    return NextResponse.json({
      message: "Persetujuan berhasil disimpan",
      data: newPersetujuan,
    });
  } catch (error) {
    console.error("Error in Persetujuan POST:", error);
    return handleApiError(error);
  }
}

// DELETE: Untuk Admin jika ingin menghapus (Opsional)
export async function DELETE(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) return NextResponse.json({ message: "Invalid id." }, { status: 400 });

    const deleted = await prisma.persetujuan.delete({ where: { id } });

    await createAuditLog({
      pengajuanId: deleted.pengajuanId,
      userId: auth.userId,
      action: "PERSETUJUAN_DELETE",
      detail: "Menghapus persetujuan",
    });

    return NextResponse.json({ message: "Persetujuan deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}