"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RiwayatDekan from './riwayat';
import { useRouter, usePathname } from "next/navigation";
import "./home.css";

type Pengajuan = {
  id: string;
  nama: string;
  judul: string;
  status: "diproses" | "menunggu";
  tanggal: string;
  keterangan?: string;
};

export default function DekanHomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Dekan");
  const [processedCount, setProcessedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Cek autentikasi
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userData = localStorage.getItem('userData');

    console.log('Auth check:', { token, role, userData });

    // Ambil nama user
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.nama || 'Dekan');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    loadPengajuan();
  }, []);

  const loadPengajuan = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching pengajuan with token:', token);
      
      const res = await fetch('/api/dekan/pengajuan', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', res.status);

      if (res.status === 401) {
        // Token expired atau tidak valid
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userData');
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        if (res.status === 404) {
          setPengajuan([]);
          setProcessedCount(0);
          setPendingCount(0);
          return;
        }
        
        const data = await res.json().catch(() => ({ message: 'Gagal memuat pengajuan' }));
        throw new Error(data.message || 'Gagal memuat pengajuan');
      }

      const data = await res.json();
      console.log('Pengajuan data:', data);

      // Map data ke format yang diharapkan
      const mapped: Pengajuan[] = (data.data || []).map((p: any) => ({
        id: String(p.id || p._id || Date.now()),
        nama: p.pemohon?.nama || p.nama || '-',
        judul: p.judul || p.namaSistem || '-',
        status: p.status === 'DISETUJUI' || p.status === 'DIPROSES' ? 'diproses' : 'menunggu',
        tanggal: p.tanggal || p.createdAt || new Date().toISOString().split('T')[0],
        keterangan: p.keterangan || p.catatan || '',
      }));

      setPengajuan(mapped);
      setProcessedCount(mapped.filter(p => p.status === 'diproses').length);
      setPendingCount(mapped.filter(p => p.status === 'menunggu').length);
      
    } catch (e) {
      console.error('Error loading pengajuan:', e);
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan saat memuat pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  const handleViewDetail = (id: string, status: string) => {
    if (status === 'diproses') {
      window.location.href = `/dekan/detail_setuju/${id}`;
    } else {
      window.location.href = `/dekan/detail_wait/${id}`;
    }
  };

  return (
    <div className="staff-page">
      <div className="hider"></div>
      <header className="topbar">
        <div className="top-left">
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold" }}>Dekan</div>
          <img className="log01" src="/img/logo1.png" alt="Logo 1" />
          <img className="log02" src="/img/logo2.png" alt="Logo 2" />
        </div>
        
        <div style={{
          display: 'flex',
          gap: '30px',
          marginLeft: 'auto',
          marginRight: 'auto',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <Link 
            href="/dekan"
            style={{
              padding: '8px 0',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: pathname === '/dekan' ? 'bold' : 'normal',
              color: pathname === '/dekan' ? '#1f8a3d' : '#333',
              borderBottom: pathname === '/dekan' ? '3px solid #1f8a3d' : 'none'
            }}
          >
            Home
            {pendingCount > 0 && pathname !== '/dekan' && (
              <span style={{
                marginLeft: '8px',
                backgroundColor: '#ff4444',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '12px'
              }}>
                {pendingCount}
              </span>
            )}
          </Link>
          <Link 
            href="/dekan/riwayat"
            style={{
              padding: '8px 0',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: pathname === '/dekan/riwayat' ? 'bold' : 'normal',
              color: pathname === '/dekan/riwayat' ? '#1f8a3d' : '#333',
              borderBottom: pathname === '/dekan/riwayat' ? '3px solid #1f8a3d' : 'none'
            }}
          >
            Riwayat
          </Link>
        </div>

        <div className="top-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Informasi user di sebelah kanan sebelum logout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#666',
            fontSize: '14px'
          }}>
            <span>Log</span>
            <span style={{ fontWeight: 'bold' }}>tang, {userName}</span>
          </div>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-left">
            <h1>Selamat Datang, {userName}</h1>
            <p>Semoga hari-mu selalu menyenangkan ya!<br />Ada pengajuan yang perlu diproses hari ini?</p>
          </div>
          <div className="hero-right">
            <img src="/img/staff.png" alt="p" className="p" />
          </div>
        </section>

        {/* Status boxes dengan fungsi navigasi */}
        <div className="status-boxes">
          <Link 
            href="/dekan/riwayat"
            className="status-box processed"
            style={{ textDecoration: 'none' }}
          >
            <span className="icon"></span>
            <span>{processedCount} Pengajuan Diproses</span>
          </Link>
          <div className="status-box pending">
            <span className="icon"></span>
            <span>{pendingCount} Menunggu Diproses</span>
          </div>
        </div>

        <section className="kelola">
          <div className="kelola-inner">Daftar Pengajuan</div>
        </section>

        <section className="users-area">
          <div className="pengajuan-card">
            <h2><b>Pengajuan</b></h2>
            
            {error && (
              <div className="error-message" style={{
                backgroundColor: '#FFEBEE',
                color: '#C62828',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}
            
            {loading && (
              <div className="info-message" style={{
                textAlign: 'center',
                padding: '32px 0',
                color: '#666'
              }}>
                Memuat pengajuan...
              </div>
            )}
            
            <div className="table-wrap">
              <table className="pengajuan-table">
                <thead>
                  <tr>
                    <th>Nama Pemohon</th>
                    <th>Judul Pengajuan</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Keterangan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && pengajuan.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
                        Belum ada pengajuan yang diberikan oleh Wakil Dekan.
                      </td>
                    </tr>
                  )}
                  {pengajuan.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nama}</td>
                      <td>{p.judul}</td>
                      <td>{new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                      <td>
                        {p.status === 'diproses' ? (
                          <span style={{ color: '#1f8a3d', fontWeight: 600 }}>Diproses</span>
                        ) : (
                          <span style={{ color: '#b89c1c', fontWeight: 600 }}>Menunggu</span>
                        )}
                      </td>
                      <td>{p.keterangan || '-'}</td>
                      <td>
                        <button 
                          onClick={() => handleViewDetail(p.id, p.status)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}