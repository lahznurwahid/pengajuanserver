"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import '../../admin-dashboard.css';
import '../../kelola-server.css';
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
					<button className="nav-link" onClick={() => router.push('/admin')}>Dashboard</button>
					<button className="nav-link" onClick={() => router.push('/admin/kelola-server')}>Kelola Server</button>
					<button className="nav-link" onClick={() => router.push('/admin/manajemen-akun')}>Manajemen Akun</button>
				</nav>
				<div className="header-right">
					<button className="logout-btn" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); router.push('/'); }}>Logout</button>
				</div>
			</header>

			<main className="admin-main-content">
				<div className="welcome-card" style={{ marginBottom: 24 }}>
					<button className="btn-back" onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f0f0', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
						<ArrowLeft size={18} /> Kembali
					</button>
				</div>

				<div className="table-wrapper" style={{ maxWidth: 800, margin: '0 auto', marginBottom: 32 }}>
					<h2 className="detail-title" style={{ textAlign: 'center', color: '#2e7d32', fontSize: 26, margin: '24px 0' }}>Detail Pengajuan Layanan</h2>
					{loading ? (
						<div style={{ textAlign: 'center', padding: 32 }}>Memuat data...</div>
					) : error ? (
						<div style={{ color: 'red', textAlign: 'center', padding: 32 }}>{error}</div>
					) : pengajuan ? (
						<div className="detail-card" style={{ background: '#fff', borderRadius: 18, padding: 28, border: '2px solid #2e7d32' }}>
							<div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
								<div>
									<h4>Pemohon</h4>
									<p>Nama: {pengajuan.pemohon?.nama || pengajuan.nama || '-'}</p>
									<p>Email: {pengajuan.pemohon?.email || pengajuan.email || '-'}</p>
								</div>
								<div>
									<h4>Permintaan Server</h4>
									<p>Nama Sistem: {pengajuan.namaSistem || '-'}</p>
									<p>Pemilik Sistem: {pengajuan.pemilikSistem || '-'}</p>
									<p>Fungsi Sistem: {pengajuan.fungsiSistem || '-'}</p>
								</div>
								<div>
									<h4>Akses & Jaringan</h4>
									<p>Akses Publik: {pengajuan.aksesPublik ? 'Ya' : 'Tidak'}</p>
									<p>Alamat Layanan: {pengajuan.namaAlamatLayanan || '-'}</p>
									<p>User SSH: {pengajuan.userSSH || '-'}</p>
									<p>Jenis Database: {pengajuan.jenisDatabase || '-'}</p>
								</div>
								<div>
									<h4>Spesifikasi</h4>
									<p>CPU (Core): {pengajuan.kebutuhanCPU ?? '-'}</p>
									<p>RAM (GB): {pengajuan.kebutuhanRAM ?? '-'}</p>
									<p>Storage (GB): {pengajuan.kebutuhanStorage ?? '-'}</p>
									<p>OS: {pengajuan.sistemOperasi || '-'}</p>
								</div>
							</div>
							<div style={{ marginTop: 32, textAlign: 'center' }}>
								{pengajuan.status !== 'SELESAI' ? (
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
					) : null}
				</div>
			</main>
		</div>
	);
}
