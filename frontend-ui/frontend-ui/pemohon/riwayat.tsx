"use client";

import { useEffect, useMemo, useState } from "react";
import "./riwayat.css";

type Pengajuan = {
  id: number | string;
  namaSistem?: string;
  status?: string;
  tanggalPengajuan?: string;
  pemohon?: {
    nama?: string;
    email?: string;
    noHp?: string;
  };
  [key: string]: any;
};

export default function TrackingPage() {
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        console.log("riwayat: token from localStorage:", token);
        if (!token) {
          setError("Silakan login terlebih dahulu");
          setLoading(false);
          return;
        }

        console.log("riwayat: fetching /api/pengajuan with token");
        const res = await fetch("/api/pengajuan", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("riwayat: response status", res.status);
        const respText = await res.clone().text().catch(() => null);
        console.log("riwayat: response text preview:", respText ? respText.slice(0, 1000) : null);

        if (!res.ok) {
          // try to read backend message for better debugging
          let msg = "Gagal memuat data";
          try {
            const j = await res.json();
            msg = j?.message || msg;
          } catch (e) {
            // ignore
          }
          console.error("GET /api/pengajuan failed", res.status, msg);
          throw new Error(msg);
        }

        const json = await res.json();
        setPengajuan(json.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        setPengajuan([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return pengajuan;
    const q = query.toLowerCase();
    return pengajuan.filter((p) => {
      const id = String(p.id || "").toLowerCase();
      const nama = String(p.namaSistem || "").toLowerCase();
      const email = String(p.pemohon?.email || "").toLowerCase();
      const noHp = String(p.pemohon?.noHp || "").toLowerCase();
      return id.includes(q) || nama.includes(q) || email.includes(q) || noHp.includes(q);
    });
  }, [pengajuan, query]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
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
          <a href="/pemohon" style={{ fontWeight: "bold" }}>Home</a>
          <a href="/pemohon/riwayat" style={{color: "#2e7d32", fontWeight: "bold"}}>Tracking</a>
          <a href="/form-pengajuan" style={{ fontWeight: "bold" }}>Form Pengajuan</a>
        </nav>
        <button className="logout" style={{ fontWeight: "bold" }} onClick={handleLogout}>Logout</button>
      </header>

      {/* CONTENT */}
      <main className="tracking-wrapper">
        <div className="tracking-header">
          <h2>Tracking status pengajuan</h2>
          <p>Kamu bisa cek status pengajuan-mu disini yaaa...</p>
        </div>

        <div className="tracking-card">
          <div className="tracking-search">
            <input
              type="text"
              placeholder="Masukkan Kode, E-mail, atau No.Hp"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn-green" onClick={() => window.location.href = "/form-pengajuan"}>Daftar Pengajuan</button>
          </div>

          {/* TABLE */}
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>Memuat...</div>
          ) : error ? (
            <div style={{ padding: "20px", textAlign: "center", color: "red" }}>{error}</div>
          ) : filtered.length > 0 ? (
            <table className="tracking-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Kode/ID</th>
                  <th>Nama Layanan</th>
                  
                  <th>Status</th>
                  <th>Email</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={`${p.id}-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>{String(p.id).padStart(7, "0")}</td>
                    <td>{p.namaSistem || "-"}</td>
                    
                    <td className={`status-${p.status?.toLowerCase()}`}>{p.status || "-"}</td>
                    <td>{p.pemohon?.email || "-"}</td>
                    <td>
                      <a href={`/pemohon/riwayat/detail?id=${p.id}`} className="btn-detail">
                        Detail
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="tracking-empty">
              <span>ATAU</span>
              <div className="empty-box">
                <p>Data tidak ditemukan</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
