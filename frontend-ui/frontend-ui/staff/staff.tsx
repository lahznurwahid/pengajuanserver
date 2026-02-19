"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./staff.css";

type User = {
	id: string;
	name: string;
	jabatan: string;
	email: string;
	phone: string;
};

//--- Staff page fungsi utama teerhubung dengan backend dan menampilkan data ---//

export default function StaffPage() {
	
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Logout handler: clear auth and redirect to login form
	const handleLogout = () => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('token');
			localStorage.removeItem('role');
			window.location.href = '/login';
		}
	};

	useEffect(() => {
	
		async function loadUsers() {
			setLoading(true);
			setError("");
			try {
				const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
				const localRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
				console.log("Role di Storage:", localRole);	
				const endpoint = localRole === 'STAF' ? '/api/users/pemohon' : '/api/users';
				const res = await fetch(endpoint, {
					headers: {
						'Content-Type': 'application/json',
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
				});

//--- Erro handling untuk autentikasi dan memuat data ---//

				if (!res.ok) {
					if (res.status === 401) {
						if (endpoint === '/api/users/pemohon') {
							setError('Unauthorized. Hanya Administrator Server (admin_server) yang dapat melihat daftar user.');
						} else {
							setError('Unauthorized. Silakan login sebagai Staff atau Administrator Server.');
						}
					} else {
						const data = await res.json().catch(() => ({ message: 'Gagal memuat user' }));
						setError(data.message || 'Gagal memuat user');
					}
					return;
				}

				const data = await res.json();
				const mapped: User[] = (data.data || []).map((u: any) => ({
					id: String(u.id ?? Date.now().toString()),
					name: u.nama ?? u.name ?? '',
					jabatan: u.role ?? u.jabatan ?? 'Pemohon',
					email: u.email ?? '',
					phone: u.noTelepon ?? u.phone ?? '',
				}));

				setUsers(mapped);
			} catch (e) {
				setError('Terjadi kesalahan saat memuat user');
			} finally {
				setLoading(false);
			}
		}

		loadUsers();
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const last = localStorage.getItem("lastAddedUser");
			if (last) {
				const u = JSON.parse(last);
				const newUser: User = {
					id: String(u.id ?? Date.now().toString()),
					name: u.name ?? u.nama ?? "",
					jabatan: u.jabatan ?? "Pemohon",
					email: u.email ?? "",
					phone: u.phone ?? u.noTelepon ?? "",
				};
				setUsers(prev => [newUser, ...prev]);
				localStorage.removeItem("lastAddedUser");
			}
		} catch (e) {
			// ignore parse errors
		}
	}, []);

//--- Komponen UI Halaman Staff

	return (
		<div className="staff-page">
			<div className="hider"></div>
			<header className="topbar">
				<div className="top-left">
						<div className="brand" style={{ fontSize: "24px", fontWeight: "bold" }}>Staff</div>
						<img className="log01"src="/img/logo1.png" alt="Logo 1" />
						<img className="log02"src="/img/logo2.png" alt="Logo 2" />
				</div>
				<div className="top-right">
					<button className="logout" onClick={handleLogout}>Logout</button>
				</div>
			</header>

			<main className="main-content">
				<section className="hero">
					<div className="hero-left">
						<h1>Selamat Datang,(Nama Staff)</h1>
						<p>Semoga hari-mu selalu menyenangkan ya!<br />Ada yang mau dikerjain hari ini?</p>
					</div>

					<div className="hero-right">
						{/* simple decorative vector */}
						<img src="/img/staff.png " alt="p" className="p" />
							
					</div>
				</section>

				<section className="kelola">
					<div className="kelola-inner">Kelola User</div>
				</section>

				<section className="users-area">
					<div className="users-card">
						<h1><b>Pemohon</b></h1>
						{error && <div className="error-message">{error}</div>}
						{loading && <div className="info-message">Memuat pengguna...</div>}
						<div className="table-wrap">
							<table className="user-table">
								<thead>
									<tr>
										<th>Nama</th>
										<th>Email</th>
										<th>Nomor Telepon</th>
										<th>Aksi</th>
										
									</tr>
								</thead>
								<tbody>
									{users.map((u) => (
										<tr key={u.id}>
											<td>{u.name}</td>
											<td>{u.email}</td>
											<td>{u.phone}</td>
											<td>
												<div className="actions">
													<Link href={`/staff/edit?id=${u.id}`}>
													<button className="edit">Edit</button>
													</Link>
													<button className="del">Hapus</button>
												</div>
											</td>
											
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<aside className="add-card">
					<Link href="/staff/add_user" className="add-inner" aria-label="Tambahkan akun">
					
							<div className="add-icon">
								<img src="/img/uservctr.png" alt="Add User Icon" className="add-icon-img" />
							</div>
							
							<div className="add-text">Tambahkan akun</div>
						</Link>
					</aside>
				</section>
			</main>
		</div>
	);
}