import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Roles, authenticateRequest, hasRole, sanitizeUser } from "@/lib/auth";
import { handleApiError } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);

    console.log("Data Auth dari Token:", auth);
    
    if (!auth || !hasRole(auth, [Roles.STAF, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: { role: Roles.PEMOHON },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: users.map(sanitizeUser),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
