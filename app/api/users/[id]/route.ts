import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { Roles, authenticateRequest, hasRole, sanitizeUser } from "@/lib/auth";
import { handleApiError } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ⬅️ WAJIB await

    const userId = Number(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "ID user tidak valid." },
        { status: 400 }
      );
    }

    const auth = await authenticateRequest(request);
    if (!auth || !hasRole(auth, [Roles.STAF, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: sanitizeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}


export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
      const { id } = await context.params;
        const userId = Number(id);
    try {
        const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.STAF, Roles.ADMIN_SERVER])) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();

    const { nama, email, noTelepon } = body;

    // Validasi input
    if (!nama || !email) {
      return NextResponse.json(
        { message: "Nama dan email harus diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        nama,
        email,
        noTelepon,
      },
    });

    return NextResponse.json({
      message: "User berhasil diperbarui.",
      data: sanitizeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);

  try {
    const auth = await authenticateRequest(request);

    if (!auth || !hasRole(auth, [Roles.ADMIN_SERVER])) {
      return NextResponse.json(
        { message: "Hanya admin server yang dapat menghapus user." },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: "User berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
