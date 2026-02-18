import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Roles, authenticateRequest, hasRole } from "@/lib/auth";
import { handleApiError, parseBody } from "@/lib/validation";
import { z } from "zod";

type RouteParams = {
  params: {
    id: string;
  };
};

const updatePengajuanSchema = z.object({
  // Informasi Pemohon
  nama: z.string().min(1).optional(),
  jabatan: z.string().optional(),
  email: z.string().email().optional(),
  nomorTelepon: z.string().optional(),
  
  // Informasi Permintaan
  namaSistem: z.string().min(1).optional(),
  pemilikSistem: z.string().min(1).optional(),
  penggunaSistem: z.string().min(1).optional(),
  fungsiSistem: z.string().min(1).optional(),
  
  // Kebutuhan Informasi Sistem
  aksesPublik: z.boolean().optional(),
  namaAlamatLayanan: z.string().optional(),
  port: z.coerce.number().int().positive().optional(),
  kebutuhanCPU: z.coerce.number().int().positive().optional(),
  kebutuhanRAM: z.coerce.number().int().positive().optional(),
  kebutuhanGPU: z.string().optional(),
  kebutuhanStorage: z.coerce.number().int().positive().optional(),
  sistemOperasi: z.string().min(1).optional(),
  softwareTambahan: z.string().optional(),
  userSSH: z.string().optional(),
  passwordSSH: z.string().optional(),
  jenisDatabase: z.enum(["MySQL", "PostgreSQL", "Oracle"]).optional(),
  userDatabase: z.string().optional(),
  passwordDatabase: z.string().optional(),
});

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    console.debug("/api/pengajuan/[id] GET - id:", id);
    const pengajuanId = Number(id);
    console.debug("/api/pengajuan/[id] GET - pengajuanId parsed:", pengajuanId, "isNaN:", Number.isNaN(pengajuanId));

    if (Number.isNaN(pengajuanId)) {
      console.debug("/api/pengajuan/[id] GET - invalid id, returning 400");
      return NextResponse.json({ message: "Invalid pengajuan id." }, { status: 400 });
    }

    const pengajuan = await prisma.pengajuanServer.findUnique({
          where: { id: pengajuanId },
          include: {
            pemohon: true,
            persetujuan: {
              include: {
                user: true,
              },
            },
            tindakLanjut: true,
            penerimaan: true,
            arsip: true,
            backup: true,
          },
        });

    if (!pengajuan) {
      return NextResponse.json(
        { message: "Pengajuan not found." },
        { status: 404 }
      );
    }

    if (auth.role === Roles.PEMOHON && pengajuan.pemohonId !== auth.userId) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json({
      data: pengajuan,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!hasRole(auth, [Roles.PEMOHON, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const pengajuanId = Number(id);

    if (Number.isNaN(pengajuanId)) {
      return NextResponse.json({ message: "Invalid pengajuan id." }, { status: 400 });
    }

    if (auth.role === Roles.PEMOHON && !(await canAccessPengajuan(id, auth.userId))) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { data, error } = await parseBody(request, updatePengajuanSchema);

    if (error) {
      return error;
    }

    const hasUpdates = Object.values(data).some((value) => value !== undefined);

    if (!hasUpdates) {
      return NextResponse.json(
        { message: "Tidak ada data untuk diperbarui." },
        { status: 400 }
      );
    }

    const pengajuan = await prisma.pengajuanServer.update({
      where: { id: pengajuanId },
      data: {
      
        nama: data.nama,
        jabatan: data.jabatan,
        email: data.email,
        nomorTelepon: data.nomorTelepon,
      
        namaSistem: data.namaSistem,
        pemilikSistem: data.pemilikSistem,
        penggunaSistem: data.penggunaSistem,
        fungsiSistem: data.fungsiSistem,
      
        aksesPublik: data.aksesPublik,
        namaAlamatLayanan: data.namaAlamatLayanan,
        port: data.port,
        kebutuhanCPU: data.kebutuhanCPU,
        kebutuhanRAM: data.kebutuhanRAM,
        kebutuhanGPU: data.kebutuhanGPU,
        kebutuhanStorage: data.kebutuhanStorage,
        sistemOperasi: data.sistemOperasi,
        softwareTambahan: data.softwareTambahan,
        userSSH: data.userSSH,
        passwordSSH: data.passwordSSH,
        jenisDatabase: data.jenisDatabase,
        userDatabase: data.userDatabase,
        passwordDatabase: data.passwordDatabase,
      },
    });

    return NextResponse.json({
      message: "Pengajuan updated",
      data: pengajuan,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const pengajuanId = Number(id);

    if (Number.isNaN(pengajuanId)) {
      return NextResponse.json({ message: "Invalid pengajuan id." }, { status: 400 });
    }

    await prisma.pengajuanServer.delete({
      where: { id: pengajuanId },
    });

    return NextResponse.json({
      message: "Pengajuan deleted",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function canAccessPengajuan(pengajuanId: string, userId: number) {
  const pengajuan = await prisma.pengajuanServer.findUnique({
    where: { id: Number(pengajuanId) },
    select: { pemohonId: true },
  });

  return pengajuan?.pemohonId === userId;
}