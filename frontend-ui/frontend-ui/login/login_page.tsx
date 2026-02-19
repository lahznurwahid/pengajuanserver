'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './form_login.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Login attempt:', { email, role });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let message = 'Login gagal';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          message = data.message || message;
        } else {
          const text = await response.text().catch(() => '');
          message = text ? text.slice(0, 200) : message;
        }
        throw new Error(message);
      }

      let data = { token: '', user: null as any };
      if (contentType.includes('application/json')) {
        data = await response.json();
      }

      // Simpan data ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      console.log('Login success, data saved to localStorage');

      // Tentukan redirect path
      let redirectPath = '/login';
      switch (role) {
        case 'pemohon':
          redirectPath = '/pemohon';
          break;
        case 'staf':
          redirectPath = '/staff';
          break;
        case 'kepala_lab':
          redirectPath = '/kelab';
          break;
        case 'wadek':
          redirectPath = '/wakildekan';
          break;
        case 'dekan':
          redirectPath = '/dekan';
          break;
        case 'admin_server':
          redirectPath = '/admin';
          break;
        default:
          redirectPath = '/login';
      }

      // Gunakan router.push untuk navigasi
      router.push(redirectPath);
      router.refresh(); // Refresh untuk memastikan state ter-update

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SECTION */}
      <div className="login-left">
        <img src="/img/Ellipse 1.png" alt="B1" className="img-b1" />
        <img src="/img/Ellipse 3.png" alt="B4" className="img-b4" />
        <img src="/img/Ellipse 5.png" alt="B5" className="img-b5" />
        <div className="left-content">
          <img src="/img/logoupn.png" alt="Logo" width={170} height={170}/>
          <h1 className="faculty-name">FIK UPNVJ</h1>
        </div>
      </div>

      <img src="/img/Ellipse 4.png" alt="B2" className="img-b2" />
      <img src="/img/Ellipse 2.png" alt="B3" className="img-b3" />
      
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Login</h2>
          <h4 className="login-subtitle">Manajemen Pengajuan Layanan Server</h4>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} id="loginForm">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Login sebagai</label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Pilih Role</option>
                <option value="pemohon">Pemohon</option>
                <option value="staf">Staff</option>
                <option value="kepala_lab">Kepala Laboratorium</option>
                <option value="wadek">Wakil Dekan</option>
                <option value="dekan">Dekan</option>
                <option value="admin_server">Administrator Server</option>
              </select>
            </div>
          
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}