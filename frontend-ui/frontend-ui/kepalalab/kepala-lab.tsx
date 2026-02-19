'use client';

import React, { useState, useEffect } from "react";
import './kepala-lab.css';
import RiwayatKelab from './riwayat_kelab';
import { useRouter } from "next/navigation";


type Pengajuan = {
  id: number;
  nama?: string | null;
  namaSistem: string;
  email?: string | null;
  keterangan?: string | null;
  nomorTelepon?: string | null;
  status: string;
  pemohon?: any;
  persetujuan?: Array<{
    status: string;
    user?: { role?: string } | null;
  }>;
  tanggalPengajuan?: string;
}

export default function Keplab() {
  const [activePage, setActivePage] = useState<'home' | 'riwayat'>('home');
  const router = useRouter();
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logout handler: clear auth and redirect to login form
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }     
  };

  function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  async function fetchPengajuan() {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/pengajuan', { headers });
      const body = await res.json();
      setPengajuan(Array.isArray(body.data) ? body.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPengajuan();
  }, []);


const processedStatuses = new Set(['DIPERIKSA', 'DIPROSES', 'DISELESAIKAN', 'DITERIMA', 'DISETUJUI']);
const waitingStatuses = new Set(['DIAJUKAN', 'DITANGGUHKAN']);

  const processedCount = pengajuan.filter(p => processedStatuses.has(p.status)).length;
  const waitingCount = pengajuan.filter(p => waitingStatuses.has(p.status)).length;
  // Pengajuan ditolak hanya jika status 'ditolak' dan penolakan oleh WADEK
  const rejectedCount = pengajuan.filter(p => {
    if (p.status === 'ditolak') {
      // Cari persetujuan dari WADEK yang statusnya 'DITOLAK'
      return (p.persetujuan || []).some(x => x.user?.role === 'WADEK' && /tolak/i.test(String(x.status || '')));
    }
    return false;
  }).length;

  return (
    <div className="staff-page"> {/* Pakai class staff-page agar background & font seragam */}
      <header className="topbar">
        <div className="top-left">
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold", color: "#4D9E5B" }}>Kepala Lab</div>
                <div className="logos">
            <img className="log01" src="/img/logo1.png" alt="Logo 1" />
            <img className="log02" src="/img/logo2.png" alt="Logo 2" />     
                </div>
                
          <nav className="nav-links">
            <a 
              className={activePage === 'home' ? 'active' : ''} 
              onClick={() => setActivePage('home')}
              style={{ cursor: 'pointer' }}
            >
              Home
            </a>
            <a 
              className={activePage === 'riwayat' ? 'active' : ''} 
              onClick={() => setActivePage('riwayat')}
              style={{ cursor: 'pointer' }}
            >
              Riwayat
            </a>
          </nav>
        </div>
        <div className="top-right">
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {activePage === 'home' ? (
        <main className="main-content">
          <section className="hero">
            <div className="hero-left">
              <h1>Selamat Datang, (Nama Kepala Lab)</h1>
              <p>Semoga hari-mu selalu menyenangkan ya!<br />Ada yang mau dikerjain hari ini?</p>
            </div>
            <div className="hero-right">
              <img src="img/staff.png" alt="p" className="p" />
            </div>
          </section>

          {/* Indikator 3 kotak tetap dipertahankan */}
          <section className="stats">
            <div className="stat card-green">
              <div className="stat-text"><p>Pengajuan yang</p> <p>sudah diproses</p></div>
              <div className="stat-num">{processedCount}</div>
            </div>
            <div className="stat card-yellow">
              <div className="stat-text"><p>Pengajuan yang</p> <p>menunggu proses</p></div>
              <div className="stat-num">{waitingCount}</div>
            </div>
            <div className="stat card-red">
              <div className="stat-text"><p>Pengajuan yang</p> <p>ditolak</p></div>
              <div className="stat-num">{rejectedCount}</div>
            </div>
          </section>

          <section className="users-area">
            <div className="users-card">
              <h1><b>Pengajuan</b></h1>
              <div className="table-wrap">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Nama Sistem Layanan</th>
                      <th>Email</th>
                      <th>Keterangan</th>
                      <th>Kode/ID</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6}>Memuat...</td></tr>
                    ) : pengajuan.map((p) => {
                      let keterangan = 'Diberikan oleh Pemohon';
                      if (p.status === 'ditolak' && (p.persetujuan || []).some(x => x.user?.role === 'WADEK' && /tolak/i.test(String(x.status || '')))) {
                        keterangan = 'Ditolak oleh wadek';
                      }
                      return (
                        <tr key={p.id}>
                          <td>{p.nama ?? p.pemohon?.nama ?? '-'}</td>
                          <td>{p.namaSistem}</td>
                          <td>{p.email ?? p.pemohon?.email ?? '-'}</td>
                          <td>{keterangan}</td>
                          <td>{p.id}</td>
                          <td>
                            <button className="edit" onClick={() => router.push(`/kelab/detail/${p.id}`)}>
                              Periksa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <RiwayatKelab />
      )}
    </div>
  );
}