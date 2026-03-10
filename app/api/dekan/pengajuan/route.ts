import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil semua pengajuan beserta pemohon dan persetujuan (beserta user)
    const pengajuan = await prisma.pengajuanServer.findMany({
      include: {
        pemohon: true,
        persetujuan: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { tanggalPengajuan: 'desc' },
    });

    // Filter hanya pengajuan yang sudah disetujui WADEK
    const filtered = pengajuan
      .map((p) => {
        const hasWadekApproved = p.persetujuan?.some((a) => a.user?.role?.toUpperCase().includes('WADEK') && a.status === 'DISETUJUI');
        return {
          ...p,
          hasWadekApproved,
        };
      })
      .filter((p) => p.hasWadekApproved === true);

    return NextResponse.json({ data: filtered });
  } catch (error) {
    const errMsg = (error instanceof Error) ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Gagal mengambil data pengajuan', error: errMsg }, { status: 500 });
  }
}
