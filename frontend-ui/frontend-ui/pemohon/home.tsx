"use client";

import React, { useEffect, useState } from "react";
import "./home.css";

type Pemohon = {
  id: number;
  nama: string;
};

type Pengajuan = {
  id: number;
  namaSistem: string;
  tanggalPengajuan: string;
  pemohon?: Pemohon;
};

export default function HomePage() {
  const [pengajuan, setPengajuan] = useState<Pengajuan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Silakan login untuk melihat daftar pengajuan.");
        setPengajuan([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/pengajuan", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({ message: "Gagal memuat" }));
          throw new Error(d.message || "Gagal memuat pengajuan");
        }

        const data = await res.json();
        setPengajuan(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        setPengajuan([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const goToForm = () => {
    window.location.href = "/form-pengajuan";
  };

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
          <a href="#" style={{color: "#2e7d32", fontWeight: "bold"}}>Home</a>
          <a href="/riwayat" style={{fontWeight: "bold"}}>Tracking</a>
          <a href="/form-pengajuan" style={{fontWeight: "bold"}}>Form Pengajuan</a>
        </nav>
        <button className="logout" style={{fontWeight: "bold"}}>Logout</button>
      </header>

      <main className="ph-main">
        <section className="hero">
          <div className="hero-content">
            <h1>Buat layanan server Anda sendiri dengan mudah dan cepat</h1>
            <p className="hero-sub" style={{fontWeight: "bold"}}>Isi Form, Ajukan, Selesai</p>
            <button className="btn-primary" onClick={goToForm}>
              Buat Sekarang
            </button>
          </div>
        </section>

        <section className="daftar">
          <div className="daftar-card">
            <div className="daftar-header">
              <h2>Daftar Pengajuan</h2>
              <p className="subtitle">Data Pengajuan akan muncul dalam tabel berikut.</p>
            </div>

            <div className="daftar-body">
              {loading ? (
                <div className="loading">Memuat...</div>
              ) : error ? (
                <div className="empty">
                  <div className="empty-illu">⚠️</div>
                  <div className="empty-text">{error}</div>
                </div>
              ) : pengajuan && pengajuan.length > 0 ? (
                <div className="table-wrap">
                  <table className="pengajuan-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Kode</th>
                        <th>Nama Layanan</th>
                        <th>Nama</th>
                        <th>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pengajuan.map((p, i) => (
                        <tr key={p.id}>
                          <td>{i + 1}.</td>
                          <td>{String(p.id).padStart(9, "0")}</td>
                          <td>{p.namaSistem}</td>
                          <td>{p.pemohon?.nama ?? "-"}</td>
                          <td>{new Date(p.tanggalPengajuan).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="atau">ATAU</div>
                  <div className="empty-illu">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="14" height="16" rx="2" stroke="#cbd5e1" strokeWidth="1.2" fill="#fff" />
                      <path d="M7 8h6" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="17" cy="15" r="3.2" fill="#fff" stroke="#f87171" strokeWidth="1.2" />
                      <path d="M16.1 15.9l1.8-1.8" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M16.1 14.1l1.8 1.8" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="empty-text">Data tidak ditemukan</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
