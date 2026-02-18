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

const createPenerimaanSchema = z.object({
  cpu: z.coerce.number().int().positive(),
  ram: z.coerce.number().int().positive(),
  storage: z.coerce.number().int().positive(),
  sistemOperasi: z.string().min(1),
  softwareTambahan: z.string().optional(),
});

const updatePenerimaanSchema = z.object({
  cpu: z.coerce.number().int().positive().optional(),
  ram: z.coerce.number().int().positive().optional(),
  storage: z.coerce.number().int().positive().optional(),
  sistemOperasi: z.string().min(1).optional(),
  softwareTambahan: z.string().optional(),
});

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const penerimaan = await prisma.penerimaanServer.findUnique({
      where: { pengajuanId: Number(params.id) },
    });

    if (!penerimaan) {
      return NextResponse.json(
        { message: "Penerimaan not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: penerimaan,
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

    const { data, error } = await parseBody(request, createPenerimaanSchema);

    if (error) {
      return error;
    }

    const { cpu, ram, storage, sistemOperasi, softwareTambahan } = data;

    const penerimaan = await prisma.penerimaanServer.create({
      data: {
        cpu,
        ram,
        storage,
        sistemOperasi,
        softwareTambahan: softwareTambahan ?? null,
        pengajuan: { connect: { id: Number(params.id) } },
      },
    });

    await prisma.pengajuanServer.update({
      where: { id: Number(params.id) },
      data: { status: "DISELESAIKAN" },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "PENERIMAAN",
      detail: `CPU: ${cpu} | RAM: ${ram} | Storage: ${storage} | OS: ${sistemOperasi}`,
    });

    return NextResponse.json({
      message: "Penerimaan created",
      data: penerimaan,
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

    const { data, error } = await parseBody(request, updatePenerimaanSchema);

    if (error) {
      return error;
    }

    if (
      !data.cpu &&
      !data.ram &&
      !data.storage &&
      !data.sistemOperasi &&
      !data.softwareTambahan
    ) {
      return NextResponse.json(
        { message: "Tidak ada data untuk diperbarui." },
        { status: 400 }
      );
    }

    const penerimaan = await prisma.penerimaanServer.update({
      where: { pengajuanId: Number(params.id) },
      data: {
        cpu: data.cpu,
        ram: data.ram,
        storage: data.storage,
        sistemOperasi: data.sistemOperasi,
        softwareTambahan: data.softwareTambahan,
      },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "PENERIMAAN_UPDATE",
      detail: "Update penerimaan",
    });

    return NextResponse.json({
      message: "Penerimaan updated",
      data: penerimaan,
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

    await prisma.penerimaanServer.delete({
      where: { pengajuanId: Number(params.id) },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "PENERIMAAN_DELETE",
      detail: "Delete penerimaan",
    });

    return NextResponse.json({
      message: "Penerimaan deleted",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
