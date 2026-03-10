"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "./edit.css"; // Gunakan CSS yang sama agar konsisten

export default function EditUserPage() {

        const router = useRouter();
        const searchParams = useSearchParams();
        const userId = searchParams?.get("id");


    const [formData, setFormData] = useState({
        nama: "",
        email: "",
        noTelepon: "",

    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // 1. Ambil data user yang mau diedit
    useEffect(() => {
  if (!userId) {
    setError("ID user tidak ditemukan");
    setLoading(false);
    return;
  }

        async function fetchUser() {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error("Gagal mengambil data user");

                const result = await res.json();
                const u = result.data;
                
                setFormData({
                    nama: u.nama || u.name || "",
                    email: u.email || "",
                    noTelepon: u.noTelepon || u.phone || "",

                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (userId) fetchUser();
    }, [userId]);

    // 2. Handle Update
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            console.log("TOKEN:", token);

            const res = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Gagal memperbarui user");

            router.push("/staff"); // Balik ke halaman utama staff
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="info-message">Memuat data...</div>;

return (
  <div className="staff-page">
    {/* spacer */}
    <div className="hider"></div>

    {/* header */}
    <header className="topbar">
      <div className="top-left">
        <div
          className="brand"
          style={{ fontSize: "24px", fontWeight: "bold" }}
        >
          Staff
        </div>
        <div className="logos">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="logo" key={i} aria-hidden />
          ))}
        </div>
      </div>

      <div className="top-right">
        <button className="logout">Logout</button>
      </div>
    </header>

    {/* main content */}
    <main style={{ padding: "40px" }}>
      <div
        className="users-card"
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        <h2>Edit User</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div>
            <label>Nama Lengkap</label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div>
            <label>Nomor Telepon</label>
            <input
              type="text"
              value={formData.noTelepon}
              onChange={(e) =>
                setFormData({ ...formData, noTelepon: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          <div className="actions" style={{ marginTop: "10px" }}>
            <button type="submit" className="edit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <Link
              href="/staff"
              className="detail"
              style={{
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </main>
  </div>
);

}