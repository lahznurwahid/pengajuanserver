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

const backupSchema = z.object({
  periodeBackup: z.string().min(1),
  tanggalTerakhir: z.string().optional(),
});

const updateBackupSchema = z.object({
  periodeBackup: z.string().min(1).optional(),
  tanggalTerakhir: z.string().optional(),
});

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.PEMOHON, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const backup = await prisma.backupLayanan.findUnique({
      where: { pengajuanId: Number(params.id) },
    });

    if (!backup) {
      return NextResponse.json({ message: "Backup not found." }, { status: 404 });
    }

    return NextResponse.json({
      data: backup,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.PEMOHON, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await parseBody(request, backupSchema);

    if (error) {
      return error;
    }

    const backup = await prisma.backupLayanan.create({
      data: {
        periodeBackup: data.periodeBackup,
        tanggalTerakhir: data.tanggalTerakhir
          ? new Date(data.tanggalTerakhir)
          : null,
        pengajuan: { connect: { id: Number(params.id) } },
      },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "BACKUP",
      detail: `Periode: ${data.periodeBackup}${data.tanggalTerakhir ? ` | Terakhir: ${data.tanggalTerakhir}` : ""}`,
    });

    return NextResponse.json({
      message: "Backup created",
      data: backup,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.PEMOHON, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await parseBody(request, updateBackupSchema);

    if (error) {
      return error;
    }

    if (!data.periodeBackup && !data.tanggalTerakhir) {
      return NextResponse.json(
        { message: "Tidak ada data untuk diperbarui." },
        { status: 400 }
      );
    }

    const backup = await prisma.backupLayanan.update({
      where: { pengajuanId: Number(params.id) },
      data: {
        periodeBackup: data.periodeBackup,
        tanggalTerakhir: data.tanggalTerakhir
          ? new Date(data.tanggalTerakhir)
          : undefined,
      },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "BACKUP_UPDATE",
      detail: "Update backup",
    });

    return NextResponse.json({
      message: "Backup updated",
      data: backup,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.PEMOHON, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await prisma.backupLayanan.delete({
      where: { pengajuanId: Number(params.id) },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "BACKUP_DELETE",
      detail: "Delete backup",
    });

    return NextResponse.json({
      message: "Backup deleted",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
