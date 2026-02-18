import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Roles, authenticateRequest, hasRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { handleApiError, parseBody } from "@/lib/validation";
import { z } from "zod";

type RouteParams = {
  params: {
    id: string;
  };
};

const createTindakLanjutSchema = z.object({
  deskripsi: z.string().min(1),
  tanggalMulai: z.string().min(1),
  tanggalSelesai: z.string().optional(),
});

const updateTindakLanjutSchema = z.object({
  deskripsi: z.string().min(1).optional(),
  tanggalMulai: z.string().min(1).optional(),
  tanggalSelesai: z.string().optional(),
});

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const tindakLanjut = await prisma.tindakLanjutServer.findUnique({
      where: { pengajuanId: Number(params.id) },
    });

    if (!tindakLanjut) {
      return NextResponse.json(
        { message: "Tindak lanjut not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: tindakLanjut,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await parseBody(request, createTindakLanjutSchema);

    if (error) {
      return error;
    }

    const { deskripsi, tanggalMulai, tanggalSelesai } = data;

    const tindakLanjut = await prisma.tindakLanjutServer.create({
      data: {
        deskripsi,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        pengajuan: { connect: { id: Number(params.id) } },
      },
    });

    await prisma.pengajuanServer.update({
      where: { id: Number(params.id) },
      data: { status: "DIPROSES" },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "TINDAK_LANJUT",
      detail: `Mulai: ${tanggalMulai}${tanggalSelesai ? ` | Selesai: ${tanggalSelesai}` : ""}`,
    });

    return NextResponse.json({
      message: "Tindak lanjut created",
      data: tindakLanjut,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await parseBody(request, updateTindakLanjutSchema);

    if (error) {
      return error;
    }

    if (!data.deskripsi && !data.tanggalMulai && !data.tanggalSelesai) {
      return NextResponse.json(
        { message: "Tidak ada data untuk diperbarui." },
        { status: 400 }
      );
    }

    const tindakLanjut = await prisma.tindakLanjutServer.update({
      where: { pengajuanId: Number(params.id) },
      data: {
        deskripsi: data.deskripsi,
        tanggalMulai: data.tanggalMulai ? new Date(data.tanggalMulai) : undefined,
        tanggalSelesai: data.tanggalSelesai
          ? new Date(data.tanggalSelesai)
          : undefined,
      },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "TINDAK_LANJUT_UPDATE",
      detail: "Update tindak lanjut",
    });

    return NextResponse.json({
      message: "Tindak lanjut updated",
      data: tindakLanjut,
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

    await prisma.tindakLanjutServer.delete({
      where: { pengajuanId: Number(params.id) },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "TINDAK_LANJUT_DELETE",
      detail: "Delete tindak lanjut",
    });

    return NextResponse.json({
      message: "Tindak lanjut deleted",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
