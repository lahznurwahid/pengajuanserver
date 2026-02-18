import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Roles, authenticateRequest, hasRole } from "@/lib/auth";
import { handleApiError, parseBody } from "@/lib/validation";
import { z } from "zod";

// Validasi Schema dengan Zod
const createPengajuanSchema = z.object({
  nama: z.string().optional().nullable(),
  jabatan: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  nomorTelepon: z.string().optional().nullable(),
  namaSistem: z.string().min(1),
  pemilikSistem: z.string().min(1),
  penggunaSistem: z.string().min(1),
  fungsiSistem: z.string().min(1),
  aksesPublik: z.boolean(),
  namaAlamatLayanan: z.string().optional().nullable(),
  port: z.coerce.number().int().positive().optional().nullable(),
  kebutuhanCPU: z.coerce.number().int().positive(),
  kebutuhanRAM: z.coerce.number().int().positive(),
  kebutuhanGPU: z.string().optional().nullable(),
  kebutuhanStorage: z.coerce.number().int().positive(),
  sistemOperasi: z.string().min(1),
  softwareTambahan: z.string().optional().nullable(),
  userSSH: z.string().optional().nullable(),
  passwordSSH: z.string().optional().nullable(),
  jenisDatabase: z.string().optional().nullable(),
  userDatabase: z.string().optional().nullable(),
  passwordDatabase: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

const pengajuan = await prisma.pengajuanServer.findMany({
      where: auth.role === Roles.PEMOHON ? { pemohonId: auth.userId } : undefined,
      include: {
        pemohon: true,
        // PERBAIKAN DI SINI:
        persetujuan: {
          include: {
            user: true, // Supaya status "Disetujui" muncul di riwayat
          },
        },
        tindakLanjut: true,
        penerimaan: true,
      },
      orderBy: { tanggalPengajuan: "desc" },
    });

    return NextResponse.json({ data: pengajuan });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.PEMOHON])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await parseBody(request, createPengajuanSchema);
    if (error) return error;

    // --- LOGIKA PEMBERSIHAN DATA ---
    // Prisma Enum akan error jika dikirim string kosong "". Kita harus ubah ke null.
    const validEnums = ["MySQL", "PostgreSQL", "Oracle", "MicrosoftSQLServer"];
    const cleanJenisDatabase = (data.jenisDatabase && validEnums.includes(data.jenisDatabase)) 
      ? (data.jenisDatabase as any) 
      : null;

    const created = await prisma.pengajuanServer.create({
      data: {
        nama: data.nama || null,
        jabatan: data.jabatan || null,
        email: data.email || null,
        nomorTelepon: data.nomorTelepon || null,
        namaSistem: data.namaSistem,
        pemilikSistem: data.pemilikSistem,
        penggunaSistem: data.penggunaSistem,
        fungsiSistem: data.fungsiSistem,
        aksesPublik: data.aksesPublik,
        namaAlamatLayanan: data.namaAlamatLayanan || null,
        port: data.port || null,
        kebutuhanCPU: data.kebutuhanCPU,
        kebutuhanRAM: data.kebutuhanRAM,
        kebutuhanGPU: data.kebutuhanGPU || null,
        kebutuhanStorage: data.kebutuhanStorage,
        sistemOperasi: data.sistemOperasi,
        softwareTambahan: data.softwareTambahan || null,

        // Field SSH & DB yang sebelumnya bermasalah
        userSSH: data.userSSH || null,
        passwordSSH: data.passwordSSH || null,
        jenisDatabase: cleanJenisDatabase, 
        userDatabase: data.userDatabase || null,
        passwordDatabase: data.passwordDatabase || null,

        status: "DIAJUKAN",
        pemohon: { connect: { id: auth.userId } },
      },
    });

    return NextResponse.json({
      message: "Pengajuan berhasil dibuat",
      data: created,
    });
  } catch (err) {
    console.error("Kesalahan saat POST pengajuan:", err);
    return handleApiError(err);
  }
}