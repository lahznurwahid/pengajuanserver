'use client';


import React, { useState, useMemo, useEffect } from 'react';
import './kelola-server.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

//--- Data Types ---//

interface Pengajuan {
  id: number;
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

interface KeolaServerProps {
  onAddUser?: () => void;
}


const KeolaServer: React.FC<KeolaServerProps> = ({ onAddUser }) => {
  const [persetujuanList, setPersetujuanList] = useState<PersetujuanEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();

  // Logout handler (same as admin-dashboard)
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      router.push('/');
    }
  };

  useEffect(() => {
    fetchPersetujuan();
  }, []);

  const fetchPersetujuan = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/persetujuan', { headers });
      const json = await res.json();
      const data: PersetujuanEntry[] = json?.data ?? [];
      // Show persetujuan entries from Dekan (source of approved pengajuan)
      const dekanEntries = data.filter((d) => d.user?.role === 'DEKAN');
      setPersetujuanList(dekanEntries);
    } catch (err) {
      console.error('Failed to fetch persetujuan', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter displayed entries based on search query
  const filteredServers = useMemo(() => {
    if (!searchQuery.trim()) return persetujuanList;
    const q = searchQuery.toLowerCase();
    return persetujuanList.filter((entry) =>
      String(entry.pengajuan.id).toLowerCase().includes(q) ||
      entry.pengajuan.namaSistem.toLowerCase().includes(q)
    );
  }, [persetujuanList, searchQuery]);

  const handleEdit = (id: string) => {
    console.log('Edit server dengan ID:', id);
    // Add edit logic here
  };

  const handleDelete = async (persetujuanId: number) => {
    try {
      const res = await fetch(`/api/persetujuan?id=${persetujuanId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete persetujuan');
      await fetchPersetujuan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDaftarServer = () => {
    if (onAddUser) {
      onAddUser();
    }
    console.log('Daftar Server clicked');
  };

//--- Komponen Utama ---//


return (
  <div className="admin-dashboard-container"> {/* Pakai container utama admin agar background konsisten */}
    <header className="admin-header">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="brand" style={{ fontSize: '22px', fontWeight: 700 }}>Admin Server</div>
            <div className="logos admin-logos">
              <img className="log01" src="/img/logo1.png" alt="Logo 1" />
              <img className="log02" src="/img/logo2.png" alt="Logo 2" />
            </div>
          </div>
        </div>
        <nav className="header-nav">
          <Link href="/admin" className="nav-link">Dashboard</Link>
          <Link href="/admin/kelola-server" className="nav-link">Kelola Server</Link>
          <Link href="/admin/manajemen-akun" className="nav-link">Manajemen Akun</Link>
        </nav>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

<main className="admin-main-content"> {/* Gunakan wrapper yang sama dengan dashboard */}
      <div className="kelola-header-box">
        <h1>Kelola Pengajuan Server</h1>
      </div>

      <div className="table-container"> {/* Gunakan class table-container dari dashboard agar kartu putihnya muncul */}
        <div className="kelola-note">
          <p>Note: Anda Login sebagai role Admin Server.</p>
        </div>

        <div className="search-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Masukkan Nama Layanan, ID/KODE"
            value={searchQuery}
            onChange={handleSearch}
          />
          <button className="daftar-btn" onClick={handleDaftarServer}>
            Daftar Server
          </button>
        </div>

        <div className="table-wrapper">
            {filteredServers.length > 0 ? (
              <>
                <div className="table-header">
                  <h3>Server</h3>
                </div>
                <table className="server-table">
                  <thead>
                    <tr>
                      <th>Kode/ID</th>
                      <th>Nama</th>
                      <th>Nama sistem layanan</th>
                      <th>Email</th>
                      <th>No.Hp</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServers.map((entry) => (
                      <tr key={entry.pengajuan?.id ?? entry.id}>
                        <td>{entry.pengajuan?.id ?? entry.id}</td>
                        <td>{entry.pengajuan?.pemohon?.nama ?? entry.pengajuan?.namaSistem ?? '-'}</td>
                        <td>{entry.pengajuan?.namaSistem ?? '-'}</td>
                        <td>-</td>
                        <td>{entry.pengajuan?.noTelepon ?? '-'}</td>
                        <td className="aksi-cell">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(String(entry.pengajuan?.id ?? entry.id))}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(entry.id)}
                            title="Hapus"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              /* Empty State */
              <div className="empty-state">
                <div className="empty-state-content">
                  <h3>ATAU</h3>
                  <svg
                    className="empty-icon"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Clipboard Icon */}
                    <rect x="20" y="30" width="60" height="55" rx="3" fill="none" stroke="#666" strokeWidth="2" />
                    <line x1="30" y1="30" x2="30" y2="20" stroke="#666" strokeWidth="2" />
                    <line x1="70" y1="30" x2="70" y2="20" stroke="#666" strokeWidth="2" />
                    <rect x="25" y="15" width="50" height="8" rx="1" fill="none" stroke="#666" strokeWidth="2" />
                    {/* Lines on clipboard */}
                    <line x1="30" y1="45" x2="70" y2="45" stroke="#666" strokeWidth="1.5" />
                    <line x1="30" y1="55" x2="70" y2="55" stroke="#666" strokeWidth="1.5" />
                    <line x1="30" y1="65" x2="70" y2="65" stroke="#666" strokeWidth="1.5" />
                    {/* Red X mark */}
                    <circle cx="75" cy="45" r="12" fill="none" stroke="#dc3545" strokeWidth="2" />
                    <line x1="68" y1="38" x2="82" y2="52" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" />
                    <line x1="82" y1="38" x2="68" y2="52" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p>Data tidak ditemukan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default KeolaServer;
