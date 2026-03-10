"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import "../../kepala-lab.css";

interface Pengajuan {
  id: string;
  status?: string;
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
  // FIX: State terpisah untuk pesan sukses agar tidak tertimpa error dari fetchDetail
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const getToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // FIX: Parameter `silent=true` → error fetch tidak menimpa pesan sukses/error dari handleAction
  const fetchDetail = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        handleLogout();
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`/api/pengajuan/${params.id}`, {
        headers,
        cache: "no-store",
      });

      if (res.status === 401 || res.status === 403) {
        if (!silent) setError("Sesi tidak valid. Silakan login kembali.");
        setTimeout(() => handleLogout(), 2000);
        return;
      }

      const result = await res.json();

      if (result.data) {
        setPengajuan(result.data);
      } else {
        if (!silent) setError("Data tidak ditemukan");
      }
    } catch (err) {
      // Saat silent refresh pasca-aksi, abaikan error fetch agar tidak menimpa pesan sukses
      if (!silent) setError("Gagal memuat data pengajuan");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  const handleAction = async (status: "DISETUJUI" | "DITOLAK") => {
    if (!pengajuan) return;

    const token = getToken();
    if (!token) {
      setError("Sesi telah berakhir. Silakan login kembali.");
      setTimeout(() => handleLogout(), 2000);
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const pengajuanIdAsNumber = Number(pengajuan.id);
      if (isNaN(pengajuanIdAsNumber) || pengajuanIdAsNumber <= 0) {
        setError("ID pengajuan tidak valid.");
        setSubmitting(false);
        return;
      }

      const payload = {
        pengajuanId: pengajuanIdAsNumber,
        status,
        catatan,
      };

      const res = await fetch("/api/persetujuan", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        // FIX: Tampilkan pesan sukses di dalam halaman, bukan alert()
        setSuccessMessage(
          status === "DISETUJUI"
            ? "✅ Pengajuan berhasil disetujui."
            : "✅ Pengajuan berhasil ditolak."
        );
        setCatatan("");
        setActionType(null);
        // FIX: Silent refresh — data diperbarui tanpa menimpa successMessage
        await fetchDetail(true);
      } else {
        if (res.status === 401 || res.status === 403) {
          setError("Sesi tidak valid atau tidak memiliki akses. Silakan login kembali.");
          setTimeout(() => handleLogout(), 2000);
        } else {
          setError(result.message || "Gagal memproses pengajuan");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  const checkRole = (role: string | undefined, target: string) => {
    if (!role) return false;
    return role.toUpperCase().replace(/-/g, "_") === target.toUpperCase().replace(/-/g, "_");
  };

  const kepalaLabDecision = pengajuan?.persetujuan?.find((p) =>
    checkRole(p.user?.role, "KEPALA_LAB")
  );

  const wadekDitolak = pengajuan?.persetujuan?.find(
    (p) => checkRole(p.user?.role, "WADEK") && p.status === "DITOLAK"
  );

  const kepalaLabShouldFinalizeRejection = !!wadekDitolak && !kepalaLabDecision;

  if (loading)
    return (
      <div className="staff-page">
        <div className="main-content">Memuat data...</div>
      </div>
    );

  if (!pengajuan)
    return (
      <div className="staff-page">
        <div className="main-content">{error || "Data tidak ditemukan"}</div>
      </div>
    );

  return (
    <div className="staff-page">
      <header className="topbar">
        <div className="top-left">
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold", color: "#4D9E5B" }}>
            Kepala Lab
          </div>
          <div className="logos">
            <img className="log01" src="/img/logo1.png" alt="Logo 1" />
            <img className="log02" src="/img/logo2.png" alt="Logo 2" />
          </div>
        </div>
        <nav className="nav-links">
          <a onClick={() => router.push("/kelab")} style={{ cursor: "pointer" }}>Home</a>
          <a onClick={() => router.push("/kelab")} style={{ cursor: "pointer" }} className="active">Riwayat</a>
        </nav>
        <div className="top-right">
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="header-title-box" style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
            Detail Pengajuan Layanan
          </h1>
        </div>

        {pengajuan.status === "DITOLAK" && (
          <div style={{ marginBottom: "16px", padding: "12px", background: "#fff6f6", border: "1px solid #f2dede", borderRadius: "8px", color: "#a94442", textAlign: "center", fontWeight: 700 }}>
            Status Pengajuan: DITOLAK
          </div>
        )}

        <div className="users-card">
          <div style={{ marginBottom: "24px" }}>
            <button
              className="btn-back"
              onClick={() => router.back()}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0f0f0", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
              <ArrowLeft size={18} /> Kembali
            </button>
          </div>

          {/* FIX: Banner sukses terpisah dari error */}
          {successMessage && (
            <div style={{ color: "#1f8a3d", marginBottom: "15px", padding: "12px 16px", background: "#eaf6ee", border: "1px solid #b2dfcc", borderRadius: "8px", fontWeight: 600 }}>
              {successMessage}
            </div>
          )}
          {error && (
            <div style={{ color: "red", marginBottom: "15px", padding: "10px", background: "#fee", borderRadius: "8px" }}>
              {error}
            </div>
          )}

          {/* DATA DISPLAY */}
          <div style={{ background: "#f7faf7", borderRadius: "16px", padding: "32px 24px", marginBottom: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "32px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Pemohon</h3>
                <table style={{ fontSize: 15, color: "#222", width: "100%" }}>
                  <tbody>
                    <tr><td>Nama</td><td>: {pengajuan.pemohon?.nama || pengajuan.nama || "-"}</td></tr>
                    <tr><td>Alamat Email</td><td>: {pengajuan.pemohon?.email || pengajuan.email || "-"}</td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Permintaan server</h3>
                <table style={{ fontSize: 15, color: "#222", width: "100%" }}>
                  <tbody>
                    <tr><td>Nama Sistem</td><td>: {pengajuan.namaSistem || "-"}</td></tr>
                    <tr><td>Pemilik Sistem</td><td>: {pengajuan.pemilikSistem || "-"}</td></tr>
                    <tr><td>Fungsi Sistem</td><td>: {pengajuan.fungsiSistem || "-"}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "32px", marginTop: 32, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Akses & Jaringan</h3>
                <table style={{ fontSize: 15, color: "#222", width: "100%" }}>
                  <tbody>
                    <tr><td>Akses Publik</td><td>: {pengajuan.aksesPublik ? "Ya" : "Tidak"}</td></tr>
                    <tr><td>Alamat Layanan</td><td>: {pengajuan.namaAlamatLayanan || "-"}</td></tr>
                    <tr><td>User SSH</td><td>: {pengajuan.userSSH || "-"}</td></tr>
                    <tr><td>Jenis Database</td><td>: {pengajuan.jenisDatabase || "-"}</td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Spesifikasi</h3>
                <table style={{ fontSize: 15, color: "#222", width: "100%" }}>
                  <tbody>
                    <tr><td>CPU (Core)</td><td>: {pengajuan.kebutuhanCPU ?? "-"}</td></tr>
                    <tr><td>RAM (GB)</td><td>: {pengajuan.kebutuhanRAM ?? "-"}</td></tr>
                    <tr><td>Storage (GB)</td><td>: {pengajuan.kebutuhanStorage ?? "-"}</td></tr>
                    <tr><td>OS</td><td>: {pengajuan.sistemOperasi || "-"}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIWAYAT PERSETUJUAN */}
          <div style={{ marginTop: "40px" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "15px", borderBottom: "2px solid #eee", paddingBottom: "8px" }}>
              Riwayat Persetujuan
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {pengajuan.persetujuan && pengajuan.persetujuan.length > 0 ? (
                pengajuan.persetujuan.map((approval) => (
                  <div
                    key={approval.id}
                    style={{ padding: "15px", borderRadius: "10px", background: "#f9f9f9", borderLeft: `5px solid ${approval.status === "DISETUJUI" ? "#3aa96a" : "#e53935"}` }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>
                        {approval.user?.nama}{" "}
                        <span style={{ fontWeight: "normal", color: "#666" }}>({approval.user?.role})</span>
                      </strong>
                      <span style={{ fontSize: "12px", color: "#999" }}>
                        {new Date(approval.tanggal).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <div style={{ marginTop: "5px", fontSize: "14px" }}>
                      Status:{" "}
                      <span style={{ color: approval.status === "DISETUJUI" ? "#3aa96a" : "#e53935", fontWeight: "bold" }}>
                        {approval.status}
                      </span>
                    </div>
                    {approval.catatan && (
                      <div style={{ marginTop: "8px", fontSize: "13px", fontStyle: "italic", color: "#555" }}>
                        Catatan: "{approval.catatan}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: "#999", fontSize: "14px" }}>Belum ada riwayat persetujuan.</p>
              )}
            </div>
          </div>

          {/* TOMBOL AKSI */}
          {!kepalaLabDecision && !wadekDitolak ? (
            <div style={{ marginTop: "40px", padding: "20px", background: "#eaf6ee", borderRadius: "12px", textAlign: "center" }}>
              <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>Tindakan Kepala Lab</h2>
              {actionType === null ? (
                <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                  <button
                    onClick={() => setActionType("approve")}
                    disabled={submitting}
                    style={{ background: "#1f8a3d", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <CheckCircle size={18} /> Setujui
                  </button>
                  <button
                    onClick={() => setActionType("reject")}
                    disabled={submitting}
                    style={{ background: "#e53935", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <XCircle size={18} /> Tolak
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                  <textarea
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "15px" }}
                    placeholder={actionType === "approve" ? "Tambahkan catatan (opsional)..." : "Alasan penolakan..."}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={3}
                  />
                  <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                    <button
                      onClick={() => setActionType(null)}
                      disabled={submitting}
                      style={{ background: "#ccc", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer" }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleAction(actionType === "approve" ? "DISETUJUI" : "DITOLAK")}
                      disabled={submitting}
                      style={{ background: actionType === "approve" ? "#1f8a3d" : "#e53935", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer" }}
                    >
                      {submitting ? "Memproses..." : `Konfirmasi ${actionType === "approve" ? "Setuju" : "Tolak"}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {kepalaLabShouldFinalizeRejection ? (
                <div style={{ marginTop: "40px", padding: "20px", background: "#fff6f6", borderRadius: "12px", textAlign: "center", border: "1px solid #f2dede" }}>
                  <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Pengajuan telah ditolak oleh Wakil Dekan</h2>
                  <p style={{ color: "#666", marginBottom: "12px" }}>
                    Anda dapat menolak pengajuan ini kembali sehingga akan dikembalikan ke pemohon sebagai "Ditolak".
                  </p>
                  {actionType === "reject" ? (
                    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                      <textarea
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "15px" }}
                        placeholder="Alasan penolakan (opsional)..."
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        rows={3}
                      />
                      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                        <button
                          onClick={() => setActionType(null)}
                          disabled={submitting}
                          style={{ background: "#ccc", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer" }}
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleAction("DITOLAK")}
                          disabled={submitting}
                          style={{ background: "#e53935", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer" }}
                        >
                          {submitting ? "Memproses..." : "Konfirmasi Tolak dan Kembalikan ke Pemohon"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => setActionType("reject")}
                        disabled={submitting}
                        style={{ background: "#e53935", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        <XCircle size={18} /> Tolak dan Kembalikan ke Pemohon
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: "40px", padding: "20px", background: "#f0f0f0", borderRadius: "12px", textAlign: "center", border: "1px solid #ddd" }}>
                  <p style={{ fontWeight: "bold", margin: 0, color: "#444" }}>
                    {kepalaLabDecision
                      ? `KEPUTUSAN ANDA: ${kepalaLabDecision.status}`
                      : "PENGAJUAN INI SUDAH DITOLAK OLEH WAKIL DEKAN"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}