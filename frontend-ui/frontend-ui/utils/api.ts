// Types
export interface Pengajuan {
  id: number;
  namaSistem: string;
  pemilikSistem: string;
  penggunaSistem: string;
  fungsiSistem: string;
  aksesPublik: boolean;
  namaAlamatLayanan?: string;
  port?: number;
  kebutuhanCPU: number;
  kebutuhanRAM: number;
  kebutuhanGPU?: string;
  kebutuhanStorage: number;
  sistemOperasi: string;
  softwareTambahan?: string;
  status: string;
  tanggalPengajuan: string;
  pemohonId: number;
  nama?: string;
  jabatan?: string;
  email?: string;
  nomorTelepon?: string;
  pemohon: {
    id: number;
    nama: string;
    email: string;
    noTelepon?: string;
    role: string;
  };
  persetujuan: Array<{
    id: number;
    status: string;
    catatan?: string;
    tanggal: string;
    user: {
      id: number;
      nama: string;
      role: string;
    };
  }>;
}

export interface Persetujuan {
  id: number;
  status: string;
  catatan?: string;
  tanggal: string;
  pengajuanId: number;
  userId: number;
  user: {
    id: number;
    nama: string;
    role: string;
  };
  pengajuan?: Pengajuan;
}

// API Base
const API_BASE = '/api';

// Client-side fetch wrapper untuk browser
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'An error occurred',
        status: response.status,
      };
    }

    return {
      data: data.data || data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    };
  }
}

// Pengajuan APIs
export async function getPengajuanList() {
  return fetchAPI<Pengajuan[]>('/pengajuan');
}

export async function getPengajuanById(id: number) {
  return fetchAPI<Pengajuan>(`/pengajuan/${id}`);
}

export async function getPengajuanByStatus(status?: string, filter?: {
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (filter?.search) params.append('search', filter.search);
  if (filter?.startDate) params.append('startDate', filter.startDate);
  if (filter?.endDate) params.append('endDate', filter.endDate);

  const queryString = params.toString();
  return fetchAPI<Pengajuan[]>(`/pengajuan?${queryString}`);
}

// Persetujuan APIs
export async function submitPersetujuan(pengajuanId: number, status: string, catatan?: string) {
  return fetchAPI<Persetujuan>('/persetujuan', {
    method: 'POST',
    body: JSON.stringify({
      pengajuanId,
      status,
      catatan,
    }),
  });
}

export async function getPersetujuanByPengajuanId(pengajuanId: number) {
  return fetchAPI<Persetujuan[]>(`/persetujuan?pengajuanId=${pengajuanId}`);
}

// Status Update API
export async function updatePengajuanStatus(id: number, status: string) {
  return fetchAPI<Pengajuan>(`/pengajuan/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Helper untuk mendapatkan data yang akan ditampilkan ke Dekan
// Hanya pengajuan dengan status DISETUJUI (dari Wakil Dekan)
export async function getDekanPengajuan(filter?: {
  search?: string;
  status?: 'menunggu' | 'diproses';
  startDate?: string;
  endDate?: string;
}) {
  const params = new URLSearchParams();
  
  // Filter untuk pengajuan yang sudah melewati Wakil Dekan
  if (filter?.search) params.append('search', filter.search);
  if (filter?.startDate) params.append('startDate', filter.startDate);
  if (filter?.endDate) params.append('endDate', filter.endDate);

  const queryString = params.toString();
  return fetchAPI<Pengajuan[]>(`/pengajuan?${queryString}`);
}

// Helper untuk filter pengajuan berdasarkan status lokal (menunggu/diproses)
export function filterPengajuanByDekanStatus(
  pengajuan: Pengajuan[],
  status: 'menunggu' | 'diproses'
): Pengajuan[] {
  return pengajuan.filter(p => {
    // Menunggu: DISETUJUI oleh Wakil Dekan tapi belum ada persetujuan dari Dekan
    if (status === 'menunggu') {
      const hasWadekApproval = p.persetujuan?.some(ps => ps.user?.role === 'WADEK');
      const hasDekanApproval = p.persetujuan?.some(ps => ps.user?.role === 'DEKAN');
      return hasWadekApproval && !hasDekanApproval;
    }
    // Diproses: Sudah ada persetujuan dari Dekan
    if (status === 'diproses') {
      return p.persetujuan?.some(ps => ps.user?.role === 'DEKAN');
    }
    return false;
  });
}
