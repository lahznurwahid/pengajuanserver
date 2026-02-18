import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { Roles, authenticateRequest, hasRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { handleApiError, parseBody } from "@/lib/validation";
import { z } from "zod";



const arsipSchema = z.object({
  catatan: z.string().optional(),
});

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { params } = context;
    const auth = await authenticateRequest(request);
    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    const arsip = await prisma.arsipLayanan.findUnique({
      where: { pengajuanId: Number(params.id) },
    });
    if (!arsip) {
      return NextResponse.json({ message: "Arsip not found." }, { status: 404 });
    }
    return NextResponse.json({
      data: arsip,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { params } = context;
    const auth = await authenticateRequest(request);
    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    const { data, error } = await parseBody(request, arsipSchema);
    if (error) {
      return error;
    }
    const arsip = await prisma.arsipLayanan.create({
      data: {
        catatan: data.catatan ?? null,
        pengajuan: { connect: { id: Number(params.id) } },
      },
    });
    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "ARSIP",
      detail: data.catatan ?? null,
    });
    return NextResponse.json({
      message: "Arsip created",
      data: arsip,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { params } = context;
    const auth = await authenticateRequest(request);
    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    const { data, error } = await parseBody(request, arsipSchema);
    if (error) {
      return error;
    }
    if (!data.catatan) {
      return NextResponse.json(
        { message: "Tidak ada data untuk diperbarui." },
        { status: 400 }
      );
    }
    const arsip = await prisma.arsipLayanan.update({
      where: { pengajuanId: Number(params.id) },
      data: {
        catatan: data.catatan ?? null,
      },
    });
    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "ARSIP_UPDATE",
      detail: data.catatan ?? null,
    });
    return NextResponse.json({
      message: "Arsip updated",
      data: arsip,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { params } = context;
    const auth = await authenticateRequest(request);
    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    await prisma.arsipLayanan.delete({
      where: { pengajuanId: Number(params.id) },
    });
    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "ARSIP_DELETE",
      detail: "Delete arsip",
    });
    return NextResponse.json({
      message: "Arsip deleted",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
