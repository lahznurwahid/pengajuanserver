import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { sanitizeUser, signToken, verifyPassword, Roles } from "@/lib/auth";
import { handleApiError, parseBody } from "@/lib/validation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string(),
});

export async function POST(request: Request) {
  try {
    const {data, error} = await parseBody(request, loginSchema);

    if (error) {
      return error;
    }

    const {email, password, role} = data;

    console.log (email, password, role, error, 'ini dari login');

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    console.log(password, user.password, 'ini dari login route1');
    const valid = await verifyPassword(password, user.password);
    console.log(valid, 'ini dari login route2');
    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Normalize requested role and allow several input forms:
    // - frontend short keys like 'dekan', 'kepala_lab'
    // - enum-style values like 'DEKAN'
    const normalized = String(role).trim();

    // If the client already sent an enum-like value, accept it (case-insensitive)
    const upper = normalized.toUpperCase();
    let requestedRole: string | null = null;

    if (Object.values(Roles).includes(upper as any)) {
      requestedRole = upper;
    } else {
      // fallback mapping from common client values to enum
      const roleMap: Record<string, string> = {
        pemohon: Roles.PEMOHON,
        staf: Roles.STAF,
        kepala_lab: Roles.KEPALA_LAB,
        wadek: Roles.WADEK,
        dekan: Roles.DEKAN,
        admin_server: Roles.ADMIN_SERVER,
      };

      requestedRole = roleMap[normalized.toLowerCase()] ?? null;
    }

    console.log({ requestedRole, userRole: user.role, rawRole: role }, 'login role debug');

    if (!requestedRole || user.role !== requestedRole) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await signToken({ userId: user.id, role: user.role });

    return NextResponse.json({
      message: "Login success",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.log(error, 'ini dari catch login');
    return handleApiError(error);
  }
}
