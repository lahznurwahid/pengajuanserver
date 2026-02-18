"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Dekan");
  const [processedCount, setProcessedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'riwayat'>('home');

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

  const handleTabChange = (tab: 'home' | 'riwayat') => {
    setActiveTab(tab);
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
        <div className="top-right">
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
          <div 
            className={`status-box processed ${activeTab === 'riwayat' ? 'active' : ''}`}
            onClick={() => handleTabChange('riwayat')}
            style={{ 
              cursor: 'pointer',
              backgroundColor: activeTab === 'riwayat' ? '#e8f5e9' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <span className="icon"></span>
            <span>{processedCount} Pengajuan Diproses</span>
          </div>
          <div 
            className={`status-box pending ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabChange('home')}
            style={{ 
              cursor: 'pointer',
              backgroundColor: activeTab === 'home' ? '#fff3e0' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <span className="icon"></span>
            <span>{pendingCount} Menunggu Diproses</span>
          </div>
        </div>

        <section className="kelola">
          <div className="kelola-inner">Daftar Pengajuan</div>
        </section>

        {/* Navigasi Tabs Home dan Riwayat */}
        <div className="navigasi-tabs" style={{
          display: 'flex',
          gap: '20px',
          margin: '0 20px 20px 20px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => handleTabChange('home')}
            style={{
              padding: '8px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'home' ? 'bold' : 'normal',
              color: activeTab === 'home' ? '#1f8a3d' : '#666',
              borderBottom: activeTab === 'home' ? '3px solid #1f8a3d' : 'none',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            Home
            {activeTab === 'home' && pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#ff4444',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('riwayat')}
            style={{
              padding: '8px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'riwayat' ? 'bold' : 'normal',
              color: activeTab === 'riwayat' ? '#1f8a3d' : '#666',
              borderBottom: activeTab === 'riwayat' ? '3px solid #1f8a3d' : 'none',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            Riwayat
            {activeTab === 'riwayat' && processedCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                {processedCount}
              </span>
            )}
          </button>
        </div>

        <section className="users-area">
          <div className="pengajuan-card">
            <h2><b>{activeTab === 'home' ? 'Pengajuan Menunggu' : 'Riwayat Pengajuan Diproses'}</b></h2>
            
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
                  {!loading && pengajuan.filter(p => activeTab === 'home' ? p.status === 'menunggu' : p.status === 'diproses').length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
                        {activeTab === 'home' 
                          ? 'Tidak ada pengajuan yang menunggu diproses.' 
                          : 'Belum ada riwayat pengajuan yang diproses.'}
                      </td>
                    </tr>
                  )}
                  {pengajuan
                    .filter(p => activeTab === 'home' ? p.status === 'menunggu' : p.status === 'diproses')
                    .map((p) => (
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
                              fontSize: '12px',
                              transition: 'background-color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
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