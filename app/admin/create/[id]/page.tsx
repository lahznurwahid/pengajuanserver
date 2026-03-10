"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import '../../../../frontend-ui/frontend-ui/wakildekan/home-wakil.css';
import { ArrowLeft } from "lucide-react";

interface Pengajuan {
  id: string;
  nama?: string;
  email?: string;
  nomorTelepon?: string;
  pemohon?: {
    nama?: string;
    email?: string;
    noTelepon?: string;
  };
  namaSistem?: string;
  pemilikSistem?: string;
  penggunaSistem?: string;
  fungsiSistem?: string;
  aksesPublik?: boolean;
  namaAlamatLayanan?: string;
  port?: number;
  kebutuhanCPU?: number;
  kebutuhanRAM?: number;
  kebutuhanGPU?: string;
  kebutuhanStorage?: number;
  sistemOperasi?: string;
  softwareTambahan?: string;
  userSSH?: string;
  passwordSSH?: string;
  jenisDatabase?: string;
  userDatabase?: string;
  passwordDatabase?: string;
  status?: string;
}

export default function AdminCreateServerPage() {
  const params = useParams();
  const router = useRouter();
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/pengajuan/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      const result = await res.json();
      if (result.data) setPengajuan(result.data);
      else setError("Data tidak ditemukan");
    } catch (error) {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchDetail();
  }, [params.id]);

  const handleBuatServer = async () => {
    if (!pengajuan) return;
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/pengajuan/${pengajuan.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'SELESAI' }),
      });
      if (!res.ok) throw new Error('Gagal membuat server');
      setSuccess(true);
      await fetchDetail();
    } catch (err) {
      setError('Terjadi kesalahan saat membuat server.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <a className="nav-link" href="/admin" style={{ cursor: 'pointer', background: 'none', border: 'none' }}>Dashboard</a>
          <a className="nav-link" href="/admin/kelola-server" style={{ cursor: 'pointer', background: 'none', border: 'none' }}>Kelola Server</a>
          <a className="nav-link" href="/admin/manajemen-akun" style={{ cursor: 'pointer', background: 'none', border: 'none' }}>Manajemen Akun</a>
        </nav>
        <div className="header-right">
          <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); router.push('/'); }}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="header-title-box" style={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '24px', padding: '20px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1F702E' }}>Detail Pengajuan Layanan</h1>
        </div>

        <div className="users-card">
          <div style={{ marginBottom: "24px" }}>
            <button className="btn-back" onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f0f0', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <ArrowLeft size={18} /> Kembali
            </button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#fee', borderRadius: '8px' }}>{error}</div>}

          <div style={{ background: '#f7faf7', borderRadius: '16px', padding: '32px 24px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Data Pemohon</h3>
                <table style={{ fontSize: 15, color: '#222', width: '100%' }}>
                  <tbody>
                    <tr><td>Nama</td><td>: {pengajuan?.pemohon?.nama || pengajuan?.nama || '-'}</td></tr>
                    <tr><td>Email</td><td>: {pengajuan?.pemohon?.email || pengajuan?.email || '-'}</td></tr>
                    <tr><td>No. Telepon</td><td>: {pengajuan?.pemohon?.noTelepon || pengajuan?.nomorTelepon || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Permintaan Server</h3>
                <table style={{ fontSize: 15, color: '#222', width: '100%' }}>
                  <tbody>
                    <tr><td>Nama Sistem</td><td>: {pengajuan?.namaSistem || '-'}</td></tr>
                    <tr><td>Pemilik Sistem</td><td>: {pengajuan?.pemilikSistem || '-'}</td></tr>
                    <tr><td>Pengguna Sistem</td><td>: {pengajuan?.penggunaSistem || '-'}</td></tr>
                    <tr><td>Fungsi Sistem</td><td>: {pengajuan?.fungsiSistem || '-'}</td></tr>
                    <tr><td>Status</td><td>: {pengajuan?.status || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', marginTop: 32, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Akses & Jaringan</h3>
                <table style={{ fontSize: 15, color: '#222', width: '100%' }}>
                  <tbody>
                    <tr><td>Akses Publik</td><td>: {pengajuan?.aksesPublik ? 'Ya' : 'Tidak'}</td></tr>
                    <tr><td>Alamat Layanan</td><td>: {pengajuan?.namaAlamatLayanan || '-'}</td></tr>
                    <tr><td>Port</td><td>: {pengajuan?.port || '-'}</td></tr>
                    <tr><td>User SSH</td><td>: {pengajuan?.userSSH || '-'}</td></tr>
                    <tr><td>Password SSH</td><td>: {pengajuan?.passwordSSH || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Database & Software</h3>
                <table style={{ fontSize: 15, color: '#222', width: '100%' }}>
                  <tbody>
                    <tr><td>Jenis Database</td><td>: {pengajuan?.jenisDatabase || '-'}</td></tr>
                    <tr><td>User Database</td><td>: {pengajuan?.userDatabase || '-'}</td></tr>
                    <tr><td>Password Database</td><td>: {pengajuan?.passwordDatabase || '-'}</td></tr>
                    <tr><td>Software Tambahan</td><td>: {pengajuan?.softwareTambahan || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Spesifikasi</h3>
                <table style={{ fontSize: 15, color: '#222', width: '100%' }}>
                  <tbody>
                    <tr><td>CPU (Core)</td><td>: {pengajuan?.kebutuhanCPU ?? '-'}</td></tr>
                    <tr><td>RAM (GB)</td><td>: {pengajuan?.kebutuhanRAM ?? '-'}</td></tr>
                    <tr><td>GPU</td><td>: {pengajuan?.kebutuhanGPU || '-'}</td></tr>
                    <tr><td>Storage (GB)</td><td>: {pengajuan?.kebutuhanStorage ?? '-'}</td></tr>
                    <tr><td>OS</td><td>: {pengajuan?.sistemOperasi || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- TOMBOL AKSI ADMIN --- */}
          <div style={{ marginTop: '40px', padding: '20px', background: '#eaf6ee', borderRadius: '12px', textAlign: 'center' }}>
            {pengajuan?.status !== 'SELESAI' ? (
              <button className="daftar-btn" onClick={handleBuatServer} disabled={submitting} style={{ minWidth: 180, fontSize: 18 }}>
                {submitting ? 'Memproses...' : 'Buat Server'}
              </button>
            ) : (
              <span style={{ color: '#3aa96a', fontWeight: 'bold', fontSize: 18 }}>✓ Server sudah dibuat</span>
            )}
            <div style={{ marginTop: 12, color: '#8b6914', fontSize: 15, fontStyle: 'italic' }}>
              Data pengajuan otomatis terisi.
            </div>
            {success && <div style={{ color: '#2e7d32', marginTop: 10 }}>Server berhasil dibuat!</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
