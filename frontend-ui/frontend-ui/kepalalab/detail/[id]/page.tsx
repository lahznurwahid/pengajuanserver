"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import "../../kepala-lab.css";

interface Pengajuan {
  id: string;
  nama?: string;
  email?: string;
  nomorTelepon?: string;
  jabatan?: string;
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
  persetujuan?: Array<{
    id: string;
    status: string;
    catatan?: string;
    tanggal: string;
    user?: {
      nama?: string;
      role?: string;
    };
  }>;
}

export default function DetailPengajuanPage() {
  const params = useParams();
  const router = useRouter();
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"view" | "approve" | "reject" | null>(null);
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/pengajuan/${params.id}`, { headers, cache: 'no-store' });
      const result = await res.json();
      
      if (result.data) {
        setPengajuan(result.data);
      } else {
        setError("Data tidak ditemukan");
      }
    } catch (error) {
      setError("Gagal memuat data pengajuan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  const handleAction = async (status: "DISETUJUI" | "DITOLAK") => {
    if (!pengajuan) return;
    setSubmitting(true);
    setError("");
    try {
      const token = getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const payload = {
        pengajuanId: pengajuan.id,
        status: status,
        catatan: catatan,
      };

      const res = await fetch("/api/persetujuan", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(status === "DISETUJUI" ? "Pengajuan berhasil disetujui" : "Pengajuan berhasil ditolak");
        setCatatan("");
        setActionType(null);
        // Refresh data agar UI terupdate dan tombol hilang
        await fetchDetail();
      } else {
        const result = await res.json();
        setError(result.message || "Gagal memproses pengajuan");
      }
    } catch (error) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  // --- LOGIKA PENGECEKAN STATUS ---
  // Kita buat normalize role agar tidak sensitif terhadap besar kecil huruf atau strip
  const checkRole = (role: string | undefined, target: string) => {
    if (!role) return false;
    const normalized = role.toUpperCase().replace("-", "_");
    return normalized === target.toUpperCase().replace("-", "_");
  };

  // 1. Cek apakah Kepala Lab sudah memberikan keputusan
  const kepalaLabDecision = pengajuan?.persetujuan?.find(
    (p: any) => checkRole(p.user?.role, "KEPALA_LAB")
  );

  // 2. Cek apakah sudah ditolak oleh WADEK
  const wadekDitolak = pengajuan?.persetujuan?.find(
    (p: any) => checkRole(p.user?.role, "WADEK") && p.status === "DITOLAK"
  );

  if (loading) return <div className="staff-page"><div className="main-content">Memuat data...</div></div>;
  if (!pengajuan) return <div className="staff-page"><div className="main-content">{error || "Data tidak ditemukan"}</div></div>;

  return (
    <div className="staff-page">
      <header className="topbar">
        <div className="top-left">
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold", color: "#4D9E5B" }}>Kepala Lab</div>

                  <div className="logos">
            <img className="log01" src="/img/logo1.png" alt="Logo 1" />
            <img className="log02" src="/img/logo2.png" alt="Logo 2" />
           
          </div>
        </div>
        <nav className="nav-links">
          <a onClick={() => router.push('/kelab')} style={{ cursor: 'pointer' }}>Home</a>
          <a onClick={() => router.push('/kelab')} style={{ cursor: 'pointer' }} className="active">Riwayat</a>
        </nav>
        <div className="top-right">
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="header-title-box" style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>Detail Pengajuan Layanan</h1>
        </div>

        <div className="users-card">
          <div style={{ marginBottom: "24px" }}>
            <button className="btn-back" onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f0f0', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <ArrowLeft size={18} /> Kembali
            </button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#fee', borderRadius: '8px' }}>{error}</div>}

          {/* --- DATA DISPLAY --- */}
          <div style={{ background: '#f7faf7', borderRadius: '16px', padding: '32px 24px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Pemohon</h3>
                <table style={{ fontSize: 15, color: '#222', width: '100%' }}>
                  <tbody>
                    <tr><td>Nama</td><td>: {pengajuan.pemohon?.nama || pengajuan.nama || '-'}</td></tr>
                    <tr><td>Alamat Email</td><td>: {pengajuan.pemohon?.email || pengajuan.email || '-'}</td></tr>
                   
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Permintaan server</h3>
                <table style={{ fontSize: 15, color: '#222', width: '100%' }}>
                  <tbody>
                    <tr><td>Nama Sistem</td><td>: {pengajuan.namaSistem || '-'}</td></tr>
                    <tr><td>Pemilik Sistem</td><td>: {pengajuan.pemilikSistem || '-'}</td></tr>
                    <tr><td>Fungsi Sistem</td><td>: {pengajuan.fungsiSistem || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', marginTop: 32, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Akses & Jaringan</h3>
                <table style={{ fontSize: 15, color: '#222', width: '100%' }}>
                  <tbody>
                    <tr><td>Akses Publik</td><td>: {pengajuan.aksesPublik ? 'Ya' : 'Tidak'}</td></tr>
                    <tr><td>Alamat Layanan</td><td>: {pengajuan.namaAlamatLayanan || '-'}</td></tr>
                    <tr><td>User SSH</td><td>: {pengajuan.userSSH || '-'}</td></tr>
                    <tr><td>Jenis Database</td><td>: {pengajuan.jenisDatabase || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Spesifikasi</h3>
                <table style={{ fontSize: 15, color: '#222', width: '100%' }}>
                  <tbody>
                    <tr><td>CPU (Core)</td><td>: {pengajuan.kebutuhanCPU ?? '-'}</td></tr>
                    <tr><td>RAM (GB)</td><td>: {pengajuan.kebutuhanRAM ?? '-'}</td></tr>
                    <tr><td>Storage (GB)</td><td>: {pengajuan.kebutuhanStorage ?? '-'}</td></tr>
                    <tr><td>OS</td><td>: {pengajuan.sistemOperasi || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- RIWAYAT PERSETUJUAN --- */}
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #eee', paddingBottom: '8px' }}>Riwayat Persetujuan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {pengajuan.persetujuan && pengajuan.persetujuan.length > 0 ? (
                pengajuan.persetujuan.map((approval: any) => (
                  <div key={approval.id} style={{ padding: '15px', borderRadius: '10px', background: '#f9f9f9', borderLeft: `5px solid ${approval.status === 'DISETUJUI' ? '#3aa96a' : '#e53935'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{approval.user?.nama} <span style={{ fontWeight: 'normal', color: '#666' }}>({approval.user?.role})</span></strong>
                      <span style={{ fontSize: '12px', color: '#999' }}>{new Date(approval.tanggal).toLocaleDateString("id-ID")}</span>
                    </div>
                    <div style={{ marginTop: '5px', fontSize: '14px' }}>
                      Status: <span style={{ color: approval.status === 'DISETUJUI' ? '#3aa96a' : '#e53935', fontWeight: 'bold' }}>{approval.status}</span>
                    </div>
                    {approval.catatan && <div style={{ marginTop: '8px', fontSize: '13px', fontStyle: 'italic', color: '#555' }}>Catatan: "{approval.catatan}"</div>}
                  </div>
                ))
              ) : (
                <p style={{ color: '#999', fontSize: '14px' }}>Belum ada riwayat persetujuan.</p>
              )}
            </div>
          </div>

          {/* --- TOMBOL AKSI (Hanya muncul jika belum ada keputusan) --- */}
          {!kepalaLabDecision && !wadekDitolak ? (
            <div style={{ marginTop: '40px', padding: '20px', background: '#eaf6ee', borderRadius: '12px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Tindakan Kepala Lab</h2>
              {actionType === null ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  <button onClick={() => setActionType("approve")} disabled={submitting} style={{ background: '#1f8a3d', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} /> Setujui
                  </button>
                  <button onClick={() => setActionType("reject")} disabled={submitting} style={{ background: '#e53935', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={18} /> Tolak
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <textarea
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px' }}
                    placeholder={actionType === 'approve' ? 'Tambahkan catatan (opsional)...' : 'Alasan penolakan...'}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={3}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button onClick={() => setActionType(null)} disabled={submitting} style={{ background: '#ccc', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>Batal</button>
                    <button 
                      onClick={() => handleAction(actionType === "approve" ? "DISETUJUI" : "DITOLAK")}
                      disabled={submitting}
                      style={{ background: actionType === "approve" ? '#1f8a3d' : '#e53935', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {submitting ? "Memproses..." : `Konfirmasi ${actionType === "approve" ? "Setuju" : "Tolak"}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: '40px', padding: '20px', background: '#f0f0f0', borderRadius: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
              <p style={{ fontWeight: 'bold', margin: 0, color: '#444' }}>
                {kepalaLabDecision 
                  ? `KEPUTUSAN ANDA: ${kepalaLabDecision.status}` 
                  : "PENGAJUAN INI SUDAH DITOLAK OLEH WAKIL DEKAN"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
