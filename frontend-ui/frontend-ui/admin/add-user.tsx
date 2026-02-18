"use client";

import React, { useState } from "react";
import './add-user.css';

type RoleOption = { value: string; label: string };

interface AddUserProps {
  onClose: () => void;
  onCreated: (user: any) => void;
  roleOptions?: RoleOption[];
}

export default function AddUser({ onClose, onCreated, roleOptions = [] }: AddUserProps) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roleOptions[0]?.value ?? 'STAF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nama || !email || !password || !role) {
      setError('Semua field wajib diisi');
      return;
    }

    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nama, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Gagal membuat user' }));
        throw new Error(data.message || 'Gagal membuat user');
      }

      const data = await res.json();
      onCreated(data.data ?? data.user ?? {});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-backdrop" role="dialog" aria-modal="true">
      <div className="add-user-modal">
        <h3>Tambahkan Akun</h3>
        <form className="add-user-form" onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama pengguna" />
          </div>

          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain" />
          </div>

          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
          </div>

          <div>
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {roleOptions.length > 0 ? (
                roleOptions.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))
              ) : (
                <>
                  <option value="STAF">Staff</option>
                  <option value="KEPALA_LAB">Kepala Lab</option>
                  <option value="DEKAN">Dekan</option>
                  <option value="WADEK">Wakil Dekan</option>
                </>
              )}
            </select>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="add-user-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-primary-sm" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
