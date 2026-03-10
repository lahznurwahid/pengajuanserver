"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./detail.css";

type Persetujuan = {
  id: string | number;
  status: string;
  catatan?: string;
  tanggal: string;
  user?: {
    nama?: string;
    role?: string;
  };
};

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
  persetujuan?: Persetujuan[];
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
        console.log("Data dari API:", json.data);
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

  // --- Helper: ambil persetujuan berdasarkan role ---
  const getApprovalByRole = (targetRole: string): Persetujuan | undefined => {
    return pengajuan?.persetujuan?.find((p) => {
      const r = (p.user?.role || "").toUpperCase().replace(/-/g, "_");
      return r === targetRole || r.includes(targetRole);
    });
  };

  const kepalaLabApproval = getApprovalByRole("KEPALA_LAB");
  const wadekApproval     = getApprovalByRole("WADEK");
  const dekanApproval     = getApprovalByRole("DEKAN");

  // Admin ditentukan dari field status pengajuan
  const isAdminDone       = pengajuan?.status === "SELESAI";
  const isAdminProcessing = dekanApproval?.status === "DISETUJUI" && !isAdminDone;

  // Ada penolakan di salah satu tahap?
  const anyRejected = [kepalaLabApproval, wadekApproval, dekanApproval].some(
    (a) => a?.status === "DITOLAK"
  );

  // Stepper stages (4 tahap)
  const stepperStages = [
    {
      label: "Kepala Lab",
      isApproved: kepalaLabApproval?.status === "DISETUJUI",
      isRejected: kepalaLabApproval?.status === "DITOLAK",
    },
    {
      label: "Wakil Dekan",
      isApproved: wadekApproval?.status === "DISETUJUI",
      isRejected: wadekApproval?.status === "DITOLAK",
    },
    {
      label: "Dekan",
      isApproved: dekanApproval?.status === "DISETUJUI",
      isRejected: dekanApproval?.status === "DITOLAK",
    },
    {
      label: "Admin",
      isApproved: isAdminDone,
      isRejected: false,
    },
  ];

  // --- Loading State ---
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold" }}>
            {pengajuan?.pemohon?.nama ?? "-"}
          </div>
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
            {/* Pemohon */}
            <div>
              <h4>Pemohon</h4>
              <p><b>Nama:</b> {pengajuan.pemohon.nama}</p>
              <p><b>Email:</b> {pengajuan.pemohon.email}</p>
              <p><b>No Telp:</b> {pengajuan.pemohon.noTelepon || "-"}</p>
            </div>

            {/* Permintaan Server */}
            <div>
              <h4>Permintaan Server</h4>
              <p><b>Nama Sistem:</b> {pengajuan.namaSistem}</p>
              <p><b>Pemilik:</b> {pengajuan.pemilikSistem}</p>
              <p><b>Pengguna:</b> {pengajuan.penggunaSistem}</p>
              <p><b>Fungsi:</b> {pengajuan.fungsiSistem}</p>
              <p>
                <b>Tanggal Pengajuan:</b>{" "}
                {pengajuan.tanggalPengajuan
                  ? new Date(pengajuan.tanggalPengajuan).toLocaleDateString("id-ID")
                  : "-"}
              </p>
            </div>

            {/* Akses & Jaringan */}
            <div>
              <h4>Akses &amp; Jaringan</h4>
              <p><b>Domain:</b> {pengajuan.namaAlamatLayanan || "-"}</p>
              <p><b>Port:</b> {pengajuan.port || "-"}</p>
            </div>

            {/* Spesifikasi */}
            <div>
              <h4>Spesifikasi</h4>
              <p><b>CPU:</b> {pengajuan.kebutuhanCPU} Core</p>
              <p><b>RAM:</b> {pengajuan.kebutuhanRAM} GB</p>
              <p><b>Storage:</b> {pengajuan.kebutuhanStorage} GB</p>
              <p><b>OS:</b> {pengajuan.sistemOperasi}</p>
            </div>

            {/* Akses SSH */}
            <div>
              <h4>Akses SSH</h4>
              <p><b>User SSH:</b> {pengajuan.userSSH || "-"}</p>
              <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <b>Password SSH:</b>{" "}
                {pengajuan.passwordSSH ? (
                  <>
                    <span style={{ marginLeft: 4 }}>{showSSH ? pengajuan.passwordSSH : "******"}</span>
                    <button
                      type="button"
                      aria-label={showSSH ? "Sembunyikan password SSH" : "Tampilkan password SSH"}
                      onClick={() => setShowSSH((v) => !v)}
                      style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}
                    >
                      {showSSH ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24">
                          <path stroke="#333" strokeWidth="2" d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"/>
                          <circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="2"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24">
                          <path stroke="#333" strokeWidth="2" d="M17.94 17.94C16.11 19.23 14.13 20 12 20c-5.4 0-9-8-9-8a17.3 17.3 0 0 1 4.06-5.94M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12"/>
                          <path stroke="#333" strokeWidth="2" d="m1 1 22 22"/>
                        </svg>
                      )}
                    </button>
                  </>
                ) : "-"}
              </p>
            </div>

            {/* Database */}
            <div>
              <h4>Database</h4>
              <p><b>Jenis Database:</b> {pengajuan.jenisDatabase || "-"}</p>
              <p><b>User DB:</b> {pengajuan.userDatabase || "-"}</p>
              <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <b>Password DB:</b>{" "}
                {pengajuan.passwordDatabase ? (
                  <>
                    <span style={{ marginLeft: 4 }}>{showDB ? pengajuan.passwordDatabase : "******"}</span>
                    <button
                      type="button"
                      aria-label={showDB ? "Sembunyikan password DB" : "Tampilkan password DB"}
                      onClick={() => setShowDB((v) => !v)}
                      style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}
                    >
                      {showDB ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                          <path stroke="#333" strokeWidth="2" d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"/>
                          <circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="2"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                          <path stroke="#333" strokeWidth="2" d="M17.94 17.94C16.11 19.23 14.13 20 12 20c-5.4 0-9-8-9-8a17.3 17.3 0 0 1 4.06-5.94M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12"/>
                          <path stroke="#333" strokeWidth="2" d="m1 1 22 22"/>
                        </svg>
                      )}
                    </button>
                  </>
                ) : "-"}
              </p>
            </div>
          </div>

          {/* =====================================================
              STATUS PERSETUJUAN — 4 Tahap: Kepala Lab → Wakil Dekan → Dekan → Admin
          ====================================================== */}
          <div style={{ marginTop: "32px", borderTop: "2px solid #e8f5e9", paddingTop: "24px" }}>
            <h4 style={{ marginBottom: "16px", fontWeight: 700, fontSize: "16px" }}>
              Status Persetujuan
            </h4>

            {/* ---- STEPPER ---- */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
                overflowX: "auto",
                paddingBottom: "4px",
              }}
            >
              {stepperStages.map((stage, idx) => {
                const isDone = stage.isApproved || stage.isRejected;
                const dotColor = stage.isApproved
                  ? "#1f8a3d"
                  : stage.isRejected
                  ? "#e53935"
                  : "#ccc";

                // Warna garis ke tahap berikutnya
                let lineColor = "#e0e0e0";
                if (idx < stepperStages.length - 1) {
                  const next = stepperStages[idx + 1];
                  if (next.isApproved) lineColor = "#1f8a3d";
                  else if (next.isRejected) lineColor = "#e53935";
                  else if (isDone) lineColor = "#a5d6a7";
                }

                return (
                  <div
                    key={stage.label}
                    style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 70 }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: dotColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 16,
                          boxShadow: isDone ? `0 0 0 3px ${dotColor}33` : "none",
                          transition: "background 0.3s",
                        }}
                      >
                        {stage.isApproved ? "✓" : stage.isRejected ? "✕" : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          marginTop: 6,
                          color: isDone ? "#333" : "#999",
                          fontWeight: isDone ? 600 : 400,
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {stage.label}
                      </span>
                    </div>
                    {idx < stepperStages.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: 3,
                          background: lineColor,
                          margin: "0 6px",
                          marginBottom: "18px",
                          borderRadius: 2,
                          transition: "background 0.3s",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ---- DETAIL CARDS ---- */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Kepala Lab, Wakil Dekan, Dekan */}
              {[
                { label: "Kepala Lab", approval: kepalaLabApproval },
                { label: "Wakil Dekan", approval: wadekApproval },
                { label: "Dekan", approval: dekanApproval },
              ].map(({ label, approval }) => {
                const isApproved = approval?.status === "DISETUJUI";
                const isRejected = approval?.status === "DITOLAK";
                const isPending  = !approval;

                return (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                      padding: "14px 18px",
                      borderRadius: "10px",
                      background: isApproved ? "#eaf6ee" : isRejected ? "#fff6f6" : "#f9f9f9",
                      borderLeft: `4px solid ${isApproved ? "#1f8a3d" : isRejected ? "#e53935" : "#ccc"}`,
                    }}
                  >
                    {/* Ikon bulat */}
                    <div
                      style={{
                        width: 32, height: 32,
                        borderRadius: "50%",
                        background: isApproved ? "#1f8a3d" : isRejected ? "#e53935" : "#ccc",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 16, flexShrink: 0,
                      }}
                    >
                      {isApproved ? "✓" : isRejected ? "✕" : "?"}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                        <strong style={{ fontSize: 15 }}>{label}</strong>
                        {approval && (
                          <span style={{ fontSize: 12, color: "#999" }}>
                            {new Date(approval.tanggal).toLocaleDateString("id-ID", {
                              day: "2-digit", month: "long", year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: "4px", fontSize: 14 }}>
                        Status:{" "}
                        <span style={{ fontWeight: "bold", color: isApproved ? "#1f8a3d" : isRejected ? "#e53935" : "#999" }}>
                          {isPending ? "Menunggu" : approval.status}
                        </span>
                      </div>
                      {approval?.user?.nama && (
                        <div style={{ marginTop: "2px", fontSize: 13, color: "#666" }}>
                          Oleh: {approval.user.nama}
                        </div>
                      )}
                      {approval?.catatan && (
                        <div style={{ marginTop: "6px", fontSize: 13, fontStyle: "italic", color: "#555", background: isRejected ? "#fff0f0" : "#f0f7f0", padding: "6px 10px", borderRadius: "6px" }}>
                          💬 Catatan: "{approval.catatan}"
                        </div>
                      )}
                      {isPending && (
                        <div style={{ marginTop: "4px", fontSize: 13, color: "#aaa" }}>
                          Belum diproses
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Admin — tahap ke-4 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "14px 18px",
                  borderRadius: "10px",
                  // Jika ada yang ditolak sebelumnya → redup
                  opacity: anyRejected ? 0.45 : 1,
                  background: isAdminDone
                    ? "#eaf6ee"
                    : isAdminProcessing
                    ? "#fffde7"
                    : "#f9f9f9",
                  borderLeft: `4px solid ${
                    anyRejected
                      ? "#ccc"
                      : isAdminDone
                      ? "#1f8a3d"
                      : isAdminProcessing
                      ? "#f9a825"
                      : "#ccc"
                  }`,
                }}
              >
                <div
                  style={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    background: anyRejected
                      ? "#ccc"
                      : isAdminDone
                      ? "#1f8a3d"
                      : isAdminProcessing
                      ? "#f9a825"
                      : "#ccc",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 16, flexShrink: 0,
                  }}
                >
                  {isAdminDone && !anyRejected ? "✓" : "4"}
                </div>

                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 15 }}>Admin</strong>
                  <div style={{ marginTop: "4px", fontSize: 14 }}>
                    Status:{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: anyRejected
                          ? "#999"
                          : isAdminDone
                          ? "#1f8a3d"
                          : isAdminProcessing
                          ? "#f9a825"
                          : "#999",
                      }}
                    >
                      {anyRejected
                        ? "Tidak Berlaku"
                        : isAdminDone
                        ? "SELESAI"
                        : isAdminProcessing
                        ? "Sedang Diproses"
                        : "Menunggu"}
                    </span>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: 13, color: "#666" }}>
                    {anyRejected
                      ? "Pengajuan ditolak sebelum sampai ke tahap ini"
                      : isAdminDone
                      ? "Server telah berhasil dibuat oleh Admin"
                      : isAdminProcessing
                      ? "Menunggu Admin untuk memproses pembuatan server"
                      : "Belum diproses"}
                  </div>
                </div>
              </div>

            </div>
          </div>
          {/* ===================================================== */}

          {/* Footer */}
          <div className="detail-footer">
            <p>
              <b>Status:</b>{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color:
                    pengajuan.status === "SELESAI"
                      ? "#1f8a3d"
                      : pengajuan.status === "DITOLAK"
                      ? "#e53935"
                      : pengajuan.status === "DIPROSES"
                      ? "#f9a825"
                      : "#b8860b",
                }}
              >
                {pengajuan.status}
              </span>
            </p>
            <button className="btn-green" onClick={() => window.history.back()}>
              Kembali
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}