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

const konfirmasiSchema = z.object({
  status: z.string().min(1),
  catatan: z.string().optional(),
});

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.PEMOHON])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!(await canAccessPengajuan(params.id, auth.userId))) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const konfirmasi = await prisma.konfirmasiLayanan.findUnique({
      where: { pengajuanId: Number(params.id) },
    });

    if (!konfirmasi) {
      return NextResponse.json(
        { message: "Konfirmasi not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: konfirmasi,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.PEMOHON])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!(await canAccessPengajuan(params.id, auth.userId))) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { data, error } = await parseBody(request, konfirmasiSchema);

    if (error) {
      return error;
    }

    const pengajuan = await prisma.pengajuanServer.findUnique({
      where: { id: Number(params.id) },
      select: { status: true },
    });

    if (!pengajuan) {
      return NextResponse.json(
        { message: "Pengajuan not found." },
        { status: 404 }
      );
    }

    if (pengajuan.status !== "DISELESAIKAN") {
      return NextResponse.json(
        { message: "Pengajuan belum diserahkan." },
        { status: 400 }
      );
    }

    const konfirmasi = await prisma.konfirmasiLayanan.create({
      data: {
        status: data.status,
        catatan: data.catatan ?? null,
        pengajuan: { connect: { id: Number(params.id) } },
        user: { connect: { id: auth.userId } },
      },
    });

    await prisma.pengajuanServer.update({
      where: { id: Number(params.id) },
      data: { status: "DITERIMA" },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "KONFIRMASI",
      detail: `Status: ${data.status}${data.catatan ? ` | Catatan: ${data.catatan}` : ""}`,
    });

    return NextResponse.json({
      message: "Konfirmasi created",
      data: konfirmasi,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.PEMOHON])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!(await canAccessPengajuan(params.id, auth.userId))) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { data, error } = await parseBody(request, konfirmasiSchema);

    if (error) {
      return error;
    }

    const konfirmasi = await prisma.konfirmasiLayanan.update({
      where: { pengajuanId: Number(params.id) },
      data: {
        status: data.status,
        catatan: data.catatan ?? null,
      },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "KONFIRMASI_UPDATE",
      detail: `Status: ${data.status}${data.catatan ? ` | Catatan: ${data.catatan}` : ""}`,
    });

    return NextResponse.json({
      message: "Konfirmasi updated",
      data: konfirmasi,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.PEMOHON])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!(await canAccessPengajuan(params.id, auth.userId))) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    await prisma.konfirmasiLayanan.delete({
      where: { pengajuanId: Number(params.id) },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "KONFIRMASI_DELETE",
      detail: "Delete konfirmasi",
    });

    return NextResponse.json({
      message: "Konfirmasi deleted",
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
