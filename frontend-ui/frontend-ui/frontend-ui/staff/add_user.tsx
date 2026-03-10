'use client';

import React, { useState } from 'react';
import './add_user.css';
import Image from 'next/image';

// Komponen halaman untuk menambahkan user baru ---//

export default function AddUserPage() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nama, email, password, noTelepon }),
      });

//--- Proses penambahan user baru ---//

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Gagal menambahkan user' }));
        throw new Error(data.message || 'Gagal menambahkan user');
      }

      const data = await res.json();
      setSuccess(data.message || 'User berhasil ditambahkan');
      setNama('');
      setEmail('');
      setNoTelepon('');
      setPassword('');

      // Optionally redirect after success
      // window.location.href = '/staff';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

//--- Halaman untuk tambah user baru ---//

  return (

    <div className="staff-page">
			<div className="hider"></div>
			<header className="topbar">
				<div className="top-left">
					<div className="brand" style={{ fontSize: "24px", fontWeight: "bold" }}>Staff</div>
                <div className="logos">
            <img className="log01" src="/img/logo1.png" alt="Logo 1" />
            <img className="log02" src="/img/logo2.png" alt="Logo 2" />     
                </div>
				</div>
				<div className="top-right">
					<button className="logout">Logout</button>
				</div>
			</header>

      <div className="add-user-page">
      <div className="add-user-wrapper">
        <div className="card-left">
          <button className="back-btn" onClick={() => history.back()}>&larr;</button>

          <div className="card">
            <h2 className="card-title">Tambahkan Akun Pemohon</h2>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <form onSubmit={handleSubmit} className="form">
              <label>
                <span>Nama</span>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama lengkap"
                  required
                />
              </label>
              
              <label>
                <span>Nomor telepon</span>
                <input
                  type="tel"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  placeholder="081234567890"
                />
              </label>

              <label>
                <span>Alamat email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                />
              </label>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card-right">
        <Image
          src="/img/laptopuser.png"
          alt="Ilustrasi tambah user"
          width={420}
          height={420}
          className="illustration"
          priority
        />
      </div>


      </div>
    </div>
    </div>
  );
}
