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
  const [showPassword, setShowPassword] = useState(false);

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
      // Log status dan content-type
      console.log('Login response:', response.status, contentType);

      // Jika response bukan JSON, tampilkan error HTML/text
      if (!contentType.includes('application/json')) {
        const text = await response.text().catch(() => '');
        setError(`Server error: ${response.status}\n${text.slice(0, 300)}`);
        setLoading(false);
        return;
      }

      // Jika response error, tampilkan pesan dari JSON
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Login gagal');
        setLoading(false);
        return;
      }

      // Success
      const data = await response.json();
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

      router.push(redirectPath);
      router.refresh();

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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '36px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 8px',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z" fill="#555"/>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5c-5 0-9.27 3.11-11 7 1.13 2.54 3.37 4.66 6.09 5.67l-1.42 1.42c-2.97-1.23-5.37-3.61-6.67-6.09C2.73 8.11 7 5 12 5c2.08 0 4.05.5 5.81 1.36l-1.43 1.43C15.05 7.5 13.56 7 12 7zm0 12c-2.76 0-5-2.24-5-5 0-.56.09-1.1.24-1.61l1.43 1.43c-.09.36-.14.74-.14 1.18 0 1.66 1.34 3 3 3 .44 0 .82-.05 1.18-.14l1.43 1.43c-.51.15-1.05.24-1.61.24zm7.19-2.36l-1.43-1.43c.09-.36.14-.74.14-1.18 0-1.66-1.34-3-3-3-.44 0-.82.05-1.18.14l-1.43-1.43c.51-.15 1.05-.24 1.61-.24 2.76 0 5 2.24 5 5 0 .56-.09 1.1-.24 1.61z" fill="#555"/>
                    </svg>
                  )}
                </button>
              </div>
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

            <div className="form-links" style={{ marginTop: '12px', display: 'flex', flexDirection: 'row', gap: '24px' }}>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScbjEWrSpCRYNDokilDnuYSSqqlke2cgAOzU7Su8ujuyWbD0g/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0070f3', textDecoration: 'underline', fontSize: '14px', fontWeight: 500 }}
              >
                Reset Password?
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdBFNXP7YIllFIgujI91sAVGZt-dIYH8Kuc2C0wdR_VEHWiaQ/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0070f3', textDecoration: 'underline', fontSize: '14px', fontWeight: 500 }}
              >
                Registrasi
              </a>
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