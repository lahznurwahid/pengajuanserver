'use client';

import React, { useState, useEffect } from 'react';
import './admin-dashboard.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ManajemenAkun from './manajemen-akun';
import KeolaServer from './kelola-server';

interface Pengajuan {
  id: number;
  nama?: string;
  namaSistem: string;
  pemilikSistem: string;
  penggunaSistem: string;
  fungsiSistem: string;
  status: string;
  nomorTelepon?: string | null;
  pemohon?: { nama?: string } | null;
}

type ViewType = 'dashboard' | 'manajemen-akun' | 'kelola-server';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState<string>('');
  const router = useRouter();

  // Hitung jumlah server yang sudah dan belum dibuat
  const serverCreated = pengajuanList.filter((p) => p.status === 'SELESAI').length;
  const serverNotCreated = pengajuanList.filter((p) => p.status === 'DIPROSES').length;

  useEffect(() => {
    fetchPengajuan();
    fetchAdminName();
  }, []);
  // Ambil nama admin dari database
  const fetchAdminName = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/users/pemohon', { headers });
      const json = await res.json();
      // Asumsikan response: { data: { nama: "Arai", role: "admin" } }
      setAdminName(json?.data?.nama || 'Admin');
    } catch (err) {
      setAdminName('Admin');
    }
  };

  const fetchPengajuan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/pengajuan', { headers });
      const json = await res.json();
      const data: Pengajuan[] = json?.data ?? [];

      // Tampilkan pengajuan yang sudah disetujui Dekan (status DIPROSES) atau sudah SELESAI
      const filtered = data.filter((p) => p.status === 'DIPROSES' || p.status === 'SELESAI');
      setPengajuanList(filtered);
    } catch (err) {
      console.error('Failed to fetch pengajuan', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/');
  };

  const handleBuat = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/pengajuan/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'SELESAI' }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui status pengajuan');

      alert('Server berhasil dibuat! Status pengajuan diperbarui menjadi SELESAI.');
      await fetchPengajuan();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat membuat server.');
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="brand" style={{ fontSize: '22px', fontWeight: '700' }}> {adminName}</div>
            <div className="logos admin-logos">
              <img className="log01" src="/img/logo1.png" alt="Logo 1" />
              <img className="log02" src="/img/logo2.png" alt="Logo 2" />
            </div>
          </div>
        </div>
        <nav className="header-nav">
          <Link href="/admin" className="nav-link">
            Dashboard
          </Link>
          <button
            className="nav-link"
            onClick={() => router.push('/admin/kelola-server')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Kelola Server
          </button>
          <button
            className="nav-link"
            onClick={() => router.push('/admin/manajemen-akun')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Manajemen Akun
          </button>
        </nav>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main-content">
        {currentView === 'dashboard' ? (
          <>
            <div className="welcome-card">
              <div className="welcome-content">
                <h2>Selamat Datang, {adminName}</h2>
                <p>Semoga hari-mu selalu memberikan nilai!</p>
                <p>Ada yang mau dikerjain hari ini?</p>
              </div>
              <div className="welcome-image">
                <img
                  src="/img/staff.png"
                  alt="Admin Staff"
                  className="vector-image"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-container">
              <div className="stat-card stat-created">
                <h3>Pengajuan pembuatan server yang sudah dibuat</h3>
                <span className="stat-number">{serverCreated}</span>
              </div>
              <div className="stat-card stat-not-created">
                <h3>Pengajuan pembuatan server yang belum dibuat</h3>
                <span className="stat-number">{serverNotCreated}</span>
              </div>
            </div>

            {/* Server Requests Table */}
            <div className="table-container">
              <h3 className="table-title">Menunggu Pengajuan Server</h3>
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Code/ID</th>
                    <th>Nama</th>
                    <th>Nama sistem layanan</th>
                    <th>Status</th>
                    <th>No.Hp</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6}>Loading...</td></tr>
                  ) : pengajuanList.length === 0 ? (
                    <tr><td colSpan={6}>Tidak ada pengajuan yang perlu diproses</td></tr>
                  ) : (
                    pengajuanList.map((pengajuan) => (
                      <tr key={pengajuan.id}>
                        <td>{pengajuan.id}</td>
                        <td>{pengajuan.pemohon?.nama ?? pengajuan.nama ?? '-'}</td>
                        <td>{pengajuan.namaSistem}</td>
                        <td>{pengajuan.status}</td>
                        <td>{pengajuan.nomorTelepon ?? '-'}</td>
                        <td>
                          {pengajuan.status === 'DIPROSES' ? (
                            <button
                              className="action-btn buat-btn"
                              onClick={() => router.push(`/admin/create/${pengajuan.id}`)}
                            >
                              Buat
                            </button>
                          ) : (
                            <span style={{ color: '#3aa96a', fontWeight: 'bold' }}>✓ Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <p className="table-note">
                Note: Jika anda klik "Buat Server", maka server baru akan langsung terbuat.
                <br />
                Pembuatan Server otomatis mengikuti permohonan/request dari pemohon.
              </p>
            </div>
          </>
        ) : currentView === 'kelola-server' ? (
          <KeolaServer onAddUser={() => console.log('Add user clicked')} />
        ) : currentView === 'manajemen-akun' ? (
          <ManajemenAkun onAddUser={() => console.log('Add user clicked')} />
        ) : null}
      </main>
    </div>
  );
};

export default AdminDashboard;