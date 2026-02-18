"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./detail.css";

type PengajuanDetail = {
  id: number;
  namaSistem: string;
  pemilikSistem: string;
  penggunaSistem: string;
  fungsiSistem: string;
  namaAlamatLayanan?: string;
  port?: number;
  kebutuhanCPU: number;
  kebutuhanRAM: number;
  kebutuhanStorage: number;
  sistemOperasi: string;
  status: string;
  tanggalPengajuan?: string | Date;
  userSSH?: string;
  passwordSSH?: string;
  jenisDatabase?: string;
  userDatabase?: string;
  passwordDatabase?: string;
  pemohon: {
    nama: string;
    email: string;
    noTelepon?: string;
  };
};

export default function DetailTracking() {
  const searchParams = useSearchParams();
  const pengajuanId = searchParams?.get("id");

  const [pengajuan, setPengajuan] = useState<PengajuanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSSH, setShowSSH] = useState(false);
  const [showDB, setShowDB] = useState(false);

  useEffect(() => {
    if (!pengajuanId) {
      setError("ID pengajuan tidak ditemukan");
      setLoading(false);
      return;
    }

    async function fetchDetail() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Silakan login terlebih dahulu");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/pengajuan/${pengajuanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          let msg = "Gagal memuat detail";
          try {
            const j = await res.json();
            msg = j?.message || msg;
          } catch (e) {}
          throw new Error(msg);
        }


        
        const json = await res.json();
        console.log("Data dari API:", json.data); // <--- Cek di console browser!
        setPengajuan(json.data);
        setPengajuan(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [pengajuanId]);

  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="pemohon-home">
        <header className="ph-topbar">
          <div className="brand">(Pemohon)</div>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </header>
        <main className="detail-wrapper">
          <div style={{ padding: "20px", textAlign: "center" }}>Memuat...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pemohon-home">
        <header className="ph-topbar">
          <div className="brand">(Pemohon)</div>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </header>
        <main className="detail-wrapper">
          <div style={{ padding: "20px", textAlign: "center", color: "red" }}>{error}</div>
        </main>
      </div>
    );
  }

  if (!pengajuan) {
    return (
      <div className="pemohon-home">
        <header className="ph-topbar">
          <div className="brand">(Pemohon)</div>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </header>
        <main className="detail-wrapper">
          <div style={{ padding: "20px", textAlign: "center" }}>Data tidak ditemukan</div>
        </main>
      </div>
    );
  }

  return (
    <div className="pemohon-home">
      <header className="ph-topbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold" }}>Nama</div>
          <div className="logos">
            <img className="log01" src="/img/logo1.png" alt="Logo 1" />
            <img className="log02" src="/img/logo2.png" alt="Logo 2" />
          </div>
        </div>
        <nav className="navlinks">
          <a href="/pemohon" style={{ color: "#2e7d32", fontWeight: "bold" }}>Home</a>
          <a href="/pemohon/riwayat" style={{ fontWeight: "bold" }}>Tracking</a>
          <a href="/form-pengajuan" style={{ fontWeight: "bold" }}>Form Pengajuan</a>
        </nav>
        <button className="logout" style={{ fontWeight: "bold" }} onClick={handleLogout}>Logout</button>
      </header>

      <main className="detail-wrapper">
        <h2 className="detail-title">Detail Tracking</h2>

        <div className="detail-card">
          <div className="detail-grid">
            <div>
              <h4>Pemohon</h4>
              <p><b>Nama:</b> {pengajuan.pemohon.nama}</p>
              <p><b>Email:</b> {pengajuan.pemohon.email}</p>
              <p><b>No Telp:</b> {pengajuan.pemohon.noTelepon || "-"}</p>
            </div>

            <div>
              <h4>Permintaan Server</h4>
              <p><b>Nama Sistem:</b> {pengajuan.namaSistem}</p>
              <p><b>Pemilik:</b> {pengajuan.pemilikSistem}</p>
              <p><b>Pengguna:</b> {pengajuan.penggunaSistem}</p>
              <p><b>Fungsi:</b> {pengajuan.fungsiSistem}</p>
              <p><b>Tanggal Pengajuan:</b> {pengajuan.tanggalPengajuan ? new Date(pengajuan.tanggalPengajuan).toLocaleDateString() : '-'}</p>
            </div>

            <div>
              <h4>Akses & Jaringan</h4>
              <p><b>Domain:</b> {pengajuan.namaAlamatLayanan || "-"}</p>
              <p><b>Port:</b> {pengajuan.port || "-"}</p>
            </div>

            <div>
              <h4>Spesifikasi</h4>
              <p><b>CPU:</b> {pengajuan.kebutuhanCPU} Core</p>
              <p><b>RAM:</b> {pengajuan.kebutuhanRAM} GB</p>
              <p><b>Storage:</b> {pengajuan.kebutuhanStorage} GB</p>
              <p><b>OS:</b> {pengajuan.sistemOperasi}</p>
            </div>

            <div>
              <h4>Akses SSH</h4>
              <p><b>User SSH:</b> {pengajuan.userSSH || "-"}</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <b>Password SSH:</b> {pengajuan.passwordSSH ? (
                  <>
                    <span style={{ marginLeft: 4 }}>
                      {showSSH ? pengajuan.passwordSSH : "******"}
                    </span>
                    <button
                      type="button"
                      aria-label={showSSH ? "Sembunyikan password SSH" : "Tampilkan password SSH"}
                      onClick={() => setShowSSH((v) => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}
                    >
                      {showSSH ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#333" strokeWidth="2" d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="2"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#333" strokeWidth="2" d="M17.94 17.94C16.11 19.23 14.13 20 12 20c-5.4 0-9-8-9-8a17.3 17.3 0 0 1 4.06-5.94M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12"/><path stroke="#333" strokeWidth="2" d="m1 1 22 22"/></svg>
                      )}
                    </button>
                  </>
                ) : "-"}
              </p>
            </div>

            <div>
              <h4>Database</h4>
              <p><b>Jenis Database:</b> {pengajuan.jenisDatabase || "-"}</p>
              <p><b>User DB:</b> {pengajuan.userDatabase || "-"}</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <b>Password DB:</b> {pengajuan.passwordDatabase ? (
                  <>
                    <span style={{ marginLeft: 4 }}>
                      {showDB ? pengajuan.passwordDatabase : "******"}
                    </span>
                    <button
                      type="button"
                      aria-label={showDB ? "Sembunyikan password DB" : "Tampilkan password DB"}
                      onClick={() => setShowDB((v) => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}
                    >
                      {showDB ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#333" strokeWidth="2" d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="2"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#333" strokeWidth="2" d="M17.94 17.94C16.11 19.23 14.13 20 12 20c-5.4 0-9-8-9-8a17.3 17.3 0 0 1 4.06-5.94M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12"/><path stroke="#333" strokeWidth="2" d="m1 1 22 22"/></svg>
                      )}
                    </button>
                  </>
                ) : "-"}
              </p>
            </div>
          </div>

          <div className="detail-footer">
            <p><b>Status:</b> {pengajuan.status}</p>
            <button
              className="btn-green"
              onClick={() => window.history.back()}
            >
              Kembali
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
