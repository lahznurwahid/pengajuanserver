import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Roles, authenticateRequest, hasRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

const allowedStatuses = [
  "DIAJUKAN",
  "DIPERIKSA",
  "DISETUJUI",
  "DITANGGUHKAN",
  "DIPROSES",
  "DISELESAIKAN",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await authenticateRequest(request);

  if (
    !auth ||
    !hasRole(auth, [Roles.KEPALA_LAB, Roles.WADEK, Roles.DEKAN, Roles.ADMIN_SERVER])
  ) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { status } = await request.json();

  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json(
      { message: "Status tidak valid." },
      { status: 400 }
    );
  }

  const updated = await prisma.pengajuanServer.update({
    where: { id: Number(params.id) },
    data: { status: status as AllowedStatus },
  });

  await createAuditLog({
    pengajuanId: Number(params.id),
    userId: auth.userId,
    action: "STATUS_UPDATE",
    detail: `Status -> ${status}`,
  });

  return NextResponse.json({
    message: "Status updated",
    data: updated,
  });
}
