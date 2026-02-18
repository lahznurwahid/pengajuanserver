import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Roles, authenticateRequest, hashPassword, sanitizeUser, signToken } from "@/lib/auth";
import { handleApiError, parseBody } from "@/lib/validation";
import { z } from "zod";

const registerSchema = z.object({
  nama: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  noTelepon: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth || auth.role !== Roles.STAF) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await parseBody(request, registerSchema);

    if (error) {
      return error;
    }

    const { nama, email, password, noTelepon } = data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        noTelepon: noTelepon ?? null,
        role: Roles.PEMOHON,
      },
    });

    const token = await signToken({ userId: user.id, role: user.role });

    return NextResponse.json({
      message: "Register success",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
