import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await authenticateRequest(request);

  if (!auth) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const logs = await prisma.auditLog.findMany({
    where: { pengajuanId: Number(params.id) },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return NextResponse.json({
    data: logs,
  });
}
