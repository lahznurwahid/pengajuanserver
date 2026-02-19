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
  noTelepon?: string | null;
  pemohon?: { nama?: string } | null;
}

interface PersetujuanEntry {
  id: number;
  status: string;
  catatan?: string | null;
  tanggal: string;
  user: { id: number; nama?: string; role?: string };
  pengajuan: Pengajuan;
}

type ViewType = 'dashboard' | 'manajemen-akun' | 'kelola-server';

//--- Data Sample/Contoh (bisa dihapus jika sudah terhubung dengan backend) ---//

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [persetujuanList, setPersetujuanList] = useState<PersetujuanEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

//--- Proses menghitung jumlah server yang sudah dan belum dibuat (Belum terhubung dengan backend) --//

  const serverCreated = persetujuanList.filter((p) => p.status === 'Diserahkan').length;
  const serverNotCreated = persetujuanList.filter((p) => p.status !== 'Diserahkan').length;

  useEffect(() => {
    fetchPersetujuan();
  }, []);

  const fetchPersetujuan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/persetujuan');
      const json = await res.json();
      const data: PersetujuanEntry[] = json?.data ?? [];
      // keep only entries submitted by Dekan
      const dekanEntries = data.filter((d) => d.user?.role === 'DEKAN');
      setPersetujuanList(dekanEntries);
    } catch (err) {
      console.error('Failed to fetch persetujuan', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const handleBuat = (id: string) => {
    // Create a persetujuan entry marking that admin has created the server and "Diserahkan" to Kepala Lab
    (async () => {
      try {
        const pengajuanId = Number(id);
        const res = await fetch('/api/persetujuan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Diserahkan', pengajuanId }),
        });
        if (!res.ok) throw new Error('Failed to create persetujuan');
        await fetchPersetujuan();
      } catch (err) {
        console.error(err);
      }
    })();
  };

//--- Komponen utama dashboard admin ---//

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="brand" style={{ fontSize: '22px', fontWeight: '700' }}>Admin Server</div>
            <div className="logos admin-logos">
              <img className="log01" src="/img/logo1.png" alt="Logo 1" />
              <img className="log02" src="/img/logo2.png" alt="Logo 2" />
            </div>
          </div>
        </div>
          <nav className="header-nav">
          <button
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
            style={{ color: 'none', fontWeight: 'none'}}
          >
            Dashboard
          </button>
          <button
            className={`nav-link ${currentView === 'kelola-server' ? 'active' : ''}`}
            onClick={() => setCurrentView('kelola-server')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Kelola Server
          </button>
          <button
            className={`nav-link ${currentView === 'manajemen-akun' ? 'active' : ''}`}
            onClick={() => setCurrentView('manajemen-akun')}
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
                <h2>Selamat Datang, (Nama Admin Server)</h2>
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
                  ) : persetujuanList.length === 0 ? (
                    <tr><td colSpan={6}>Tidak ada pengajuan dari Dekan</td></tr>
                  ) : (
                    persetujuanList.map((entry) => (
                      <tr key={entry.pengajuan.id}>
                        <td>{entry.pengajuan.id}</td>
                        <td>{entry.pengajuan.pemohon?.nama ?? entry.pengajuan.nama}</td>
                        <td>{entry.pengajuan.namaSistem}</td>
                        <td>{entry.status}</td>
                        <td>{entry.pengajuan.noTelepon ?? '-'}</td>
                        <td>
                          <button
                            className="action-btn buat-btn"
                            onClick={() => handleBuat(String(entry.pengajuan.id))}
                          >
                            Buat
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <p className="table-note">
                Note: Jika anda klik “Buat Server”, maka server baru akan langsung terbuat.
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
