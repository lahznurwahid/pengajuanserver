"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./home-wakil.css";

type Pengajuan = {
  id: string;
  nama: string;
  judul: string;
  status: "diproses" | "menunggu";
  tanggal: string;
  keterangan?: string;
  email?: string;
  statusNormalized?: string;
  hasKepalaApproved?: boolean;
};

export default function DekanHomePage() {
  const router = useRouter();
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("wakil Dekan");
  const [processedCount, setProcessedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

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
        setUserName(user.nama || 'wakil Dekan');
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
      
      const res = await fetch('/api/pengajuan', {
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
      const mapped: any[] = (data.data || []).map((p: any) => {
        const hasKepalaApproved = p.persetujuan?.some((a: any) => a.user?.role?.toUpperCase().includes('KEPALA') && a.status === 'DISETUJUI');
        // Cek status dari DEKAN dan WADEK
        const dekanRejected = p.persetujuan?.find((a: any) => a.user?.role?.toUpperCase() === 'DEKAN' && a.status === 'DITOLAK');
        const wadekProcessed = p.persetujuan?.find((a: any) => a.user?.role?.toUpperCase().includes('WADEK') && (a.status === 'DISETUJUI' || a.status === 'DITOLAK'));
        let status: 'diproses' | 'menunggu' | 'ditolak' = 'menunggu';
        if (dekanRejected) {
          status = 'ditolak';
        } else if (wadekProcessed) {
          status = 'diproses';
        }
        return {
          ...p,
          id: String(p.id || p._id || Date.now()),
          nama: p.pemohon?.nama || p.nama || '-',
          judul: p.namaSistem || p.judul || '-',
          email: p.pemohon?.email || p.email || '-',
          tanggal: p.tanggal || p.tanggalPengajuan || p.createdAt || new Date().toISOString().split('T')[0],
          keterangan: p.keterangan || p.catatan || '',
          statusNormalized: status,
          hasKepalaApproved,
          wadekApproval: wadekProcessed,
        };
      });

      // Filter hanya pengajuan yang sudah disetujui Kepala Lab (yang tampil di tabel)
      const kelabApproved = mapped.filter((p: any) => p.hasKepalaApproved === true);
      setPengajuan(mapped as any);
      setProcessedCount(kelabApproved.filter((p: any) => p.statusNormalized === 'diproses').length);
      setPendingCount(kelabApproved.filter((p: any) => p.statusNormalized === 'menunggu').length);
      setRejectedCount(kelabApproved.filter((p: any) => p.statusNormalized === 'ditolak').length);
      
    } catch (e) {
      console.error('Error loading pengajuan:', e);
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan saat memuat pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (pengajuanId: number | string, status: 'DISETUJUI' | 'DITOLAK') => {
    const token = localStorage.getItem('token');
    const note = status === 'DITOLAK' ? prompt('Alasan penolakan (opsional):') : prompt('Catatan (opsional):');
    try {
      const res = await fetch('/api/persetujuan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pengajuanId: Number(pengajuanId), status, catatan: note }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Gagal memproses' }));
        alert(err.message || 'Gagal memproses persetujuan');
      } else {
        alert(status === 'DISETUJUI' ? 'Berhasil menyetujui' : 'Berhasil menolak');
        loadPengajuan();
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };



  return (
    <div className="staff-page">
      <div className="hider"></div>
      <header className="topbar">
        <div className="top-left">
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold" }}>Wakil Dekan</div>
          <img className="log01" src="/img/logo1.png" alt="Logo 1" />
          <img className="log02" src="/img/logo2.png" alt="Logo 2" />
        </div>

        <nav className="top-nav">
          <button onClick={() => router.push('/wakildekan')} className="nav-link active" style={{ fontWeight: 'bold', color: "#2e7d32" }}>Home</button>
          <button onClick={() => router.push('/wakildekan/riwayat_wadek')} className="nav-link" style={{ fontWeight: 'bold'}}>Riwayat</button>
        </nav>
        
        
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

        {/* Status boxes */}
        <div className="wakil-status-row">
          <div className="wakil-status-card status-boxprocessed" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="wakil-status-title" style={{ textAlign: 'left', padding: '0 24px' }}>Pengajuan yang <br /> sudah diproses</div>
            <div className="wakil-status-count" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '3em', padding: '0 28px' }}>{processedCount}</div>
          </div>
          <div className="wakil-status-card status-boxpending" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="wakil-status-title" style={{ textAlign: 'left', padding: '0 24px' }}>Pengajuan yang menunggu proses</div>
            <div className="wakil-status-count" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '3em', padding: '0 28px' }}>{pendingCount}</div>
          </div>
          <div className="wakil-status-card status-boxrejected" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="wakil-status-title" style={{ textAlign: 'left', padding: '0 24px' }}>Pengajuan yang ditolak</div>
            <div className="wakil-status-count" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '3em', padding: '0 28px' }}>{rejectedCount}</div>
          </div>
        </div>

  
        <section className="wakil-table-section">
          <h3>Daftar Pengajuan</h3>
          <div className="wakil-table-wrapper">
            <table className="wakil-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Nama sistem layanan</th>
                  <th>Email</th>
                  <th>Keterangan</th>
                  <th>Kode/ID</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px 0' }}>Memuat pengajuan...</td></tr>
                )}
                {!loading && pengajuan.filter(p => p.hasKepalaApproved === true).length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>Belum ada pengajuan yang disetujui Kepala Lab.</td></tr>
                )}
                {!loading && pengajuan.filter(p => p.hasKepalaApproved === true).map((p: any) => (
                  <tr key={p.id}>
                    <td>{p.nama}</td>
                    <td>{p.judul}</td>
                    <td>{p.email}</td>
                    <td style={{ maxWidth: 250 }}>
                      {/* Keterangan: Dikirim dari Kelab atau Ditolak dari Dekan */}
                      {p.statusNormalized === 'ditolak' ? 'Ditolak dari Dekan' : 'Dikirim dari Kelab'}
                      {p.keterangan ? ` - ${p.keterangan}` : ''}
                    </td>
                    <td>{p.id}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="wakil-badge periksa"
                          onClick={() => router.push(`/wakildekan/detail/${p.id}`)}
                        >
                          Detail
                        </button>
                        {localStorage.getItem('role') === 'A' && (
                          <>
                            <button className="wakil-badge periksa" onClick={() => handleQuickAction(p.id, 'DISETUJUI')}>Setujui</button>
                            <button className="wakil-badge lihat" style={{ background: '#e53935' }} onClick={() => handleQuickAction(p.id, 'DITOLAK')}>Tolak</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}