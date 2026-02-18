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

const monitoringSchema = z.object({
  ipAddress: z.string().optional(),
  host: z.string().optional(),
  statusMonitoring: z.string().optional(),
  uptime: z.string().optional(),
});

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const monitoring = await prisma.monitoringLayanan.findUnique({
      where: { pengajuanId: Number(params.id) },
    });

    if (!monitoring) {
      return NextResponse.json(
        { message: "Monitoring not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: monitoring,
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

    const { data, error } = await parseBody(request, monitoringSchema);

    if (error) {
      return error;
    }

    if (!data.ipAddress && !data.host && !data.statusMonitoring && !data.uptime) {
      return NextResponse.json(
        { message: "Tidak ada data untuk disimpan." },
        { status: 400 }
      );
    }

    const monitoring = await prisma.monitoringLayanan.create({
      data: {
        ipAddress: data.ipAddress ?? null,
        host: data.host ?? null,
        statusMonitoring: data.statusMonitoring ?? null,
        uptime: data.uptime ?? null,
        pengajuan: { connect: { id: Number(params.id) } },
      },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "MONITORING",
      detail: "Monitoring created",
    });

    return NextResponse.json({
      message: "Monitoring created",
      data: monitoring,
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

    const { data, error } = await parseBody(request, monitoringSchema);

    if (error) {
      return error;
    }

    if (!data.ipAddress && !data.host && !data.statusMonitoring && !data.uptime) {
      return NextResponse.json(
        { message: "Tidak ada data untuk diperbarui." },
        { status: 400 }
      );
    }

    const monitoring = await prisma.monitoringLayanan.update({
      where: { pengajuanId: Number(params.id) },
      data: {
        ipAddress: data.ipAddress ?? undefined,
        host: data.host ?? undefined,
        statusMonitoring: data.statusMonitoring ?? undefined,
        uptime: data.uptime ?? undefined,
      },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "MONITORING_UPDATE",
      detail: "Monitoring updated",
    });

    return NextResponse.json({
      message: "Monitoring updated",
      data: monitoring,
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

    await prisma.monitoringLayanan.delete({
      where: { pengajuanId: Number(params.id) },
    });

    await createAuditLog({
      pengajuanId: Number(params.id),
      userId: auth.userId,
      action: "MONITORING_DELETE",
      detail: "Monitoring deleted",
    });

    return NextResponse.json({
      message: "Monitoring deleted",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
