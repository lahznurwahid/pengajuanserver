'use client';

import React, { useState, useEffect } from 'react';
import './manajemen-akun.css';
import AddUser from './add-user';
import './add-user.css';

//--- Mendefinisikan tipe data untuk user ---//

interface User {
  id: number;
  nama: string;
  email: string;
  password?: string;
  role: string;
  noTelepon?: string;
  createdAt?: string;
}

interface ManajemenAkunProps {
  onAddUser?: () => void;
}

//---- Komponen fungsi utama untuk manajemen akun ----//

const ManajemenAkun: React.FC<ManajemenAkunProps> = ({ onAddUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

//---- Fungsi untuk mengambil data user dari API ----//

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch('/api/users', {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // not authorized: redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
            return;
          }
        }
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      setUsers(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // convert enum role to friendly label
  const roleLabel = (r: string) => {
    if (!r) return r;
    const map: Record<string,string> = {
      PEMOHON: 'Pemohon',
      STAF: 'Staff',
      KEPALA_LAB: 'Kepala Lab',
      WADEK: 'Wakil Dekan',
      DEKAN: 'Dekan',
      ADMIN_SERVER: 'Admin Server',
    };
    return map[r.toUpperCase()] ?? r;
  };

  const handleOpenAdd = () => setShowAdd(true);
  const handleCloseAdd = () => setShowAdd(false);
  const handleCreated = (u: any) => {
    // after creating, refetch to pick up latest from backend
    fetchUsers();
  };

//---- Fungsi untuk aksi tombol edit dan hapus user ----//

  const handleEdit = (id: number) => {
    console.log('Edit user ID:', id);
    // Implementasi edit user
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      alert('Gagal menghapus user: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Filter users berdasarkan search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.nama.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.password && user.password.toLowerCase().includes(query))
    );
  });

//---- Render komponen menu Manajemen Akun ----//

  return (
    <div className="manajemen-akun-container">
      <div className="manajemen-akun-title-section">
        <h1 className="manajemen-akun-title">Manajemen Akun</h1>
      </div>

      <div className="manajemen-akun-content">
        {error && <div className="error-message">{error}</div>}

        <div className="riwayat-akun-section">
          <div className="riwayat-akun-header">
            <h2>Riwayat Akun</h2>
            <button className="btn-tambah-akun" onClick={handleOpenAdd}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Tambahkan akun</span>
            </button>
          </div>

          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, atau password..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Hapus pencarian"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-message">Loading...</div>
          ) : users.length === 0 ? (
            <div className="empty-message">Tidak ada data akun</div>
          ) : (
            <div className="table-wrapper">
              {filteredUsers.length === 0 ? (
                <div className="empty-message">Tidak ada hasil pencarian untuk "{searchQuery}"</div>
              ) : (
                <>
                  <div className="search-results-info">
                    Menampilkan {filteredUsers.length} dari {users.length} akun
                  </div>
                  <table className="akun-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Role</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.nama}</td>
                          <td>{user.email}</td>
                          <td>{'xxxxxx'}</td>
                          <td>
                            <span className={`role-badge role-${String(user.role).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>
                              {roleLabel(user.role)}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-edit"
                                onClick={() => handleEdit(user.id)}
                                title="Edit user"
                              >
                                Edit
                              </button>
                              <button
                                className="btn-hapus"
                                onClick={() => handleDelete(user.id)}
                                title="Hapus user"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {showAdd && (
        <AddUser
          onClose={handleCloseAdd}
          onCreated={handleCreated}
          roleOptions={Array.from(new Set(users.map(u => u.role))).map(r => ({ value: r, label: roleLabel(r) }))}
        />
      )}
    </div>
  );
};

export default ManajemenAkun;