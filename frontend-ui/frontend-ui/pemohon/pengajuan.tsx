'use client';

import React, { useState } from 'react';
import './pengajuan.css';

export default function PengajuanForm() {
  const [form, setForm] = useState({
    // Informasi Pemohon
    nama: '',
    jabatan: '',
    email: '',
    nomorTelepon: '',
    // Informasi Permintaan
    namaSistem: '',
    pemilikSistem: '',
    penggunaSistem: '',
    fungsiSistem: '',
    // Kebutuhan Informasi Sistem
    aksesPublik: true,
    namaAlamatLayanan: '',
    port: '',
    kebutuhanCPU: '',
    kebutuhanRAM: '',
    kebutuhanGPU: '',
    kebutuhanStorage: '',
    sistemOperasi: '',
    softwareTambahan: '',
    // Tambahan SSH & DB
    userSSH: '',
    passwordSSH: '',
    jenisDatabase: '',
    userDatabase: '',
    passwordDatabase: '',
    tanggalPengajuan: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const getCookie = (name: string) => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
        if (!match) return null;
        return decodeURIComponent(match.split('=')[1]);
      };

      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') ?? getCookie('token')) : null;

      if (!token) {
        throw new Error('Silakan login terlebih dahulu.');
      }

      const payload = {
        nama: form.nama || undefined,
        jabatan: form.jabatan || undefined,
        email: form.email || undefined,
        nomorTelepon: form.nomorTelepon || undefined,
        namaSistem: form.namaSistem,
        pemilikSistem: form.pemilikSistem,
        penggunaSistem: form.penggunaSistem,
        fungsiSistem: form.fungsiSistem,
        aksesPublik: !!form.aksesPublik,
        namaAlamatLayanan: form.namaAlamatLayanan || undefined,
        port: form.port ? Number(form.port) : undefined,
        kebutuhanCPU: Number(form.kebutuhanCPU) || 1,
        kebutuhanRAM: Number(form.kebutuhanRAM) || 1,
        kebutuhanGPU: form.kebutuhanGPU || undefined,
        kebutuhanStorage: Number(form.kebutuhanStorage) || 1,
        sistemOperasi: form.sistemOperasi,
        softwareTambahan: form.softwareTambahan || undefined,
        userSSH: form.userSSH || undefined,
        passwordSSH: form.passwordSSH || undefined,
        jenisDatabase: form.jenisDatabase || undefined,
        userDatabase: form.userDatabase || undefined,
        passwordDatabase: form.passwordDatabase || undefined,
        tanggalPengajuan: form.tanggalPengajuan || undefined,
      };

      const res = await fetch('/api/pengajuan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal membuat pengajuan');
      }

      setSuccess('Pengajuan berhasil dibuat!');
      // Reset Form
      setForm({
        nama: '', jabatan: '', email: '', nomorTelepon: '',
        namaSistem: '', pemilikSistem: '', penggunaSistem: '', fungsiSistem: '',
        aksesPublik: true, namaAlamatLayanan: '', port: '', kebutuhanCPU: '',
        kebutuhanRAM: '', kebutuhanGPU: '', kebutuhanStorage: '', sistemOperasi: '',
        softwareTambahan: '', userSSH: '', passwordSSH: '', jenisDatabase: '',
        userDatabase: '', passwordDatabase: '', tanggalPengajuan: '',
      });

      // Redirect ke tracking/riwayat setelah submit sukses
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/pemohon/riwayat';
        }, 1000); // beri jeda 1 detik agar pesan sukses sempat tampil
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
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
          <a href="/pemohon" style={{ fontWeight: 'bold' }}>Home</a>
          <a href="/pemohon/riwayat" style={{ fontWeight: 'bold' }}>Tracking</a>
          <a href="/form-pengajuan" style={{color: "#2e7d32", fontWeight: "bold"}}>Form Pengajuan</a>
        </nav>
        <button
          className="logout"
          style={{ fontWeight: 'bold' }}
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              window.location.href = '/';
            }
          }}
        >
          Logout
        </button>
      </header>

<div className="pengajuan-page">
  <div className="card">
    {/* HEADER BARU: Menggabungkan tombol kembali dan judul */}
    <div className="form-header-container">
      <button
        type="button"
        className="btn-kembali"
        onClick={() => window.location.href = '/pemohon/riwayat'}
      >
        ← Kembali
      </button>
      
      <div>
        <h2 style={{ color: 'var(--accent)', margin: 0, fontSize: '22px' }}>
          Detail Pengajuan Layanan
        </h2>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '2px' }}>
          Lengkapi data di bawah untuk mengajukan sistem/layanan baru.
        </p>
      </div>
    </div>

    <form onSubmit={handleSubmit} className="pengajuan-form">
      <h3>Informasi Permintaan</h3>

        <div className="row two-col">
          <div className="col">
            <label>Nama Sistem <span style={{ color: 'red' }}>*</span></label>
            <input required value={form.namaSistem} onChange={e => update('namaSistem', e.target.value)} placeholder="Contoh: E-Office" />
            
            <label>Nomor Telepon <span style={{ color: 'red' }}>*</span></label>
            <input required value={form.nomorTelepon} onChange={e => update('nomorTelepon', e.target.value)} placeholder="Contoh: 08123456789" />

            <label style={{ marginTop: '12px', display: 'block' }}>Pemilik Sistem <span style={{ color: 'red' }}>*</span></label>
            <input required value={form.pemilikSistem} onChange={e => update('pemilikSistem', e.target.value)} placeholder="Nama Unit/Instansi" />
          </div>
          <div className="col">
            <label>Pengguna Sistem <span style={{ color: 'red' }}>*</span></label>
            <input required value={form.penggunaSistem} onChange={e => update('penggunaSistem', e.target.value)} placeholder="Contoh: Seluruh Mahasiswa" />
            
            <label style={{ marginTop: '12px', display: 'block' }}>Fungsi Sistem <span style={{ color: 'red' }}>*</span></label>
            <input required value={form.fungsiSistem} onChange={e => update('fungsiSistem', e.target.value)} placeholder="Tujuan utama sistem" />
          </div>

          
        </div>

        {/* Bagian 2: Spesifikasi Teknis */}
        <h3 style={{ marginTop: '24px' }}>Kebutuhan Informasi Sistem</h3>
        <div className="row two-col">
          <div className="col">
            <label>Server diakses publik?</label>
            <div className="radio-group" style={{ margin: '8px 0 16px 0' }}>
              <label style={{ width: 'auto', fontWeight: 'normal' }}>
                <input type="radio" checked={form.aksesPublik === true} onChange={() => update('aksesPublik', true)} /> Ya
              </label>
              <label style={{ width: 'auto', fontWeight: 'normal' }}>
                <input type="radio" checked={form.aksesPublik === false} onChange={() => update('aksesPublik', false)} /> Tidak
              </label>
            </div>

            <label>Alamat Domain / Port</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input style={{ flex: 3 }} value={form.namaAlamatLayanan} onChange={e => update('namaAlamatLayanan', e.target.value)} placeholder="domain.com" />
              <input style={{ flex: 1 }} type="number" value={form.port} onChange={e => update('port', e.target.value)} placeholder="Port" />
            </div>
          </div>

          <div className="col">
            <label>CPU (Core) & RAM (GB) <span style={{ color: 'red' }}>*</span></label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input required type="number" value={form.kebutuhanCPU} onChange={e => update('kebutuhanCPU', e.target.value)} placeholder="CPU" />
              <input required type="number" value={form.kebutuhanRAM} onChange={e => update('kebutuhanRAM', e.target.value)} placeholder="RAM" />
            </div>

            <label>Storage (GB) & OS <span style={{ color: 'red' }}>*</span></label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input required type="number" value={form.kebutuhanStorage} onChange={e => update('kebutuhanStorage', e.target.value)} placeholder="GB" />
              <input required value={form.sistemOperasi} onChange={e => update('sistemOperasi', e.target.value)} placeholder="Ubuntu/Windows" />
            </div>
          </div>
        </div>

        {/* Bagian 3: Akses SSH & DB */}
        <h3 style={{ marginTop: '24px' }}>Akses Kredensial & Software</h3>
        <div className="row two-col">
          <div className="col">
            <label>User & Password SSH</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input value={form.userSSH} onChange={e => update('userSSH', e.target.value)} placeholder="User" />
              <input type="password" value={form.passwordSSH} onChange={e => update('passwordSSH', e.target.value)} placeholder="Pass" />
            </div>
            
            <label style={{ marginTop: '12px', display: 'block' }}>Jenis Database</label>
            <select 
              value={form.jenisDatabase} 
              onChange={e => update('jenisDatabase', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
            >
              <option value="">Pilih database</option>
              <option value="MySQL">MySQL</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="Oracle">Oracle</option>
               <option value="MicrosoftSQLServer">MicrosoftSQLServer</option>
            </select>
          </div>
          <div className="col">
            <label>User & Password Database</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input value={form.userDatabase} onChange={e => update('userDatabase', e.target.value)} placeholder="User DB" />
              <input type="password" value={form.passwordDatabase} onChange={e => update('passwordDatabase', e.target.value)} placeholder="Pass DB" />
            </div>

            <label style={{ marginTop: '12px', display: 'block' }}>Software Tambahan</label>
            <textarea 
              value={form.softwareTambahan} 
              onChange={e => update('softwareTambahan', e.target.value)} 
              placeholder="Redis, Nginx, dll..." 
              rows={2} 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'inherit' }} 
            />
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="form-actions">
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            {loading ? 'Mengirim...' : 'Ajukan Pengajuan'}
          </button>
        </div>
      </form>
    </div>
    
  </div>
</div>
      
);
}