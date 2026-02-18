'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './detail_setuju.css';

interface DetailSetujuProps {
  id: string;
}

interface PengajuanDetail {
  id: string;
  pemohon?: {
    nama: string;
    email: string;
    noTelepon: string;
  };
  nama?: string;
  email?: string;
  nomorTelepon?: string;
  jabatan?: string;
  namaSistem: string;
  pemilikSistem: string;
  penggunaSistem: string;
  fungsiSistem: string;
  aksesPublik: boolean;
  namaAlamatLayanan?: string;
  port?: string;
  kebutuhanCPU: string;
  kebutuhanGPU?: string;
  kebutuhanRAM: number;
  kebutuhanStorage: number;
  sistemOperasi: string;
  softwareTambahan?: string;
  status: string;
  persetujuan?: Array<{
    user?: {
      nama: string;
      role: string;
    };
    status: string;
    catatan?: string;
    tanggal: string;
  }>;
}

const DetailSetuju: React.FC<DetailSetujuProps> = ({ id }) => {
  const router = useRouter();
  const [pengajuan, setPengajuan] = useState<PengajuanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cek autentikasi
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'dekan') {
      window.location.href = '/login';
      return;
    }

    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dekan/pengajuan/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Gagal memuat detail pengajuan');
      }

      const data = await response.json();
      setPengajuan(data.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="staff-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Memuat detail pengajuan...
        </div>
      </div>
    );
  }

  if (error || !pengajuan) {
    return (
      <div className="staff-page">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          {error || 'Data tidak ditemukan'}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => window.location.href = '/dekan'}>Kembali</button>
        </div>
      </div>
    );
  }

  // Get Dean approval info
  const dekanApproval = pengajuan.persetujuan?.find(ps => ps.user?.role === 'DEKAN');

  return (
    <div className="staff-page">
      <div className="hider"></div>
      <header className="topbar">
        <div className="top-left">
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold" }}>Dekan</div>
          <img className="log01" src="/img/logo1.png" alt="Logo 1" />
          <img className="log02" src="/img/logo2.png" alt="Logo 2" />
        </div>
        <div className="top-right">
          <button className="logout" onClick={() => window.location.href = '/dekan'}>Kembali</button>
        </div>
      </header>

      <main className="main-content">
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => window.location.href = '/dekan'}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ← Kembali
          </button>
        </div>

        <h2 style={{ marginBottom: '20px' }}>Riwayat Laporan Pengajuan</h2>

        {/* Form Status - Read Only */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
            Form Pengajuan (ID: {pengajuan.id})
          </h3>

          <div style={{
            backgroundColor: '#E8F5E9',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #4CAF50'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#2E7D32' }}>
              Status: Sudah Anda Proses (Disetujui)
            </p>
            {dekanApproval && (
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#558B2F' }}>
                Disetujui pada: {new Date(dekanApproval.tanggal).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>

          {/* Applicant Info */}
          <h4>Informasi Pemohon</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div>
              <strong>Nama</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {pengajuan.pemohon?.nama || pengajuan.nama || '-'}
              </p>
            </div>
            <div>
              <strong>Jabatan</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {pengajuan.jabatan || '-'}
              </p>
            </div>
            <div>
              <strong>Email</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {pengajuan.pemohon?.email || pengajuan.email || '-'}
              </p>
            </div>
            <div>
              <strong>No. Telepon</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {pengajuan.pemohon?.noTelepon || pengajuan.nomorTelepon || '-'}
              </p>
            </div>
          </div>

          <hr style={{ borderTop: '1px solid #eee', margin: '20px 0' }} />

          {/* System Info */}
          <h4>Informasi Sistem Layanan</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div>
              <strong>Nama Sistem</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{pengajuan.namaSistem}</p>
            </div>
            <div>
              <strong>Pemilik Sistem</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{pengajuan.pemilikSistem}</p>
            </div>
            <div>
              <strong>Pengguna Sistem</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{pengajuan.penggunaSistem}</p>
            </div>
            <div>
              <strong>Fungsi Sistem</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{pengajuan.fungsiSistem}</p>
            </div>
          </div>

          <hr style={{ borderTop: '1px solid #eee', margin: '20px 0' }} />

          {/* Access & Network Info */}
          <h4>Akses & Jaringan</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div>
              <strong>Akses Publik</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {pengajuan.aksesPublik ? 'Ya' : 'Tidak'}
              </p>
            </div>
            <div>
              <strong>Alamat Layanan</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {pengajuan.namaAlamatLayanan || '-'}
              </p>
            </div>
            <div>
              <strong>Port</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {pengajuan.port || '-'}
              </p>
            </div>
          </div>

          <hr style={{ borderTop: '1px solid #eee', margin: '20px 0' }} />

          {/* Technical Specifications */}
          <h4>Spesifikasi Teknis</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div>
              <strong>CPU</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{pengajuan.kebutuhanCPU}</p>
            </div>
            <div>
              <strong>GPU</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {pengajuan.kebutuhanGPU || 'Tidak diperlukan'}
              </p>
            </div>
            <div>
              <strong>RAM</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{pengajuan.kebutuhanRAM} GB</p>
            </div>
            <div>
              <strong>Storage</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{pengajuan.kebutuhanStorage} GB</p>
            </div>
            <div>
              <strong>Sistem Operasi</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{pengajuan.sistemOperasi}</p>
            </div>
            <div>
              <strong>Software Tambahan</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {pengajuan.softwareTambahan || '-'}
              </p>
            </div>
          </div>

          <hr style={{ borderTop: '1px solid #eee', margin: '20px 0' }} />

          {/* Approval Info */}
          {dekanApproval && (
            <div style={{ marginTop: '20px' }}>
              <h4>Informasi Persetujuan</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}>
                <div>
                  <strong>Disetujui oleh</strong>
                  <p style={{ margin: '4px 0', color: '#666' }}>
                    {dekanApproval.user?.nama || 'Dekan'}
                  </p>
                </div>
                <div>
                  <strong>Tanggal Persetujuan</strong>
                  <p style={{ margin: '4px 0', color: '#666' }}>
                    {new Date(dekanApproval.tanggal).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {dekanApproval.catatan && (
                <div style={{ marginTop: '16px' }}>
                  <strong>Catatan</strong>
                  <p style={{
                    margin: '4px 0',
                    color: '#666',
                    backgroundColor: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '4px',
                    minHeight: '60px'
                  }}>
                    {dekanApproval.catatan}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Message */}
          <div style={{
            backgroundColor: '#E3F2FD',
            border: '1px solid #2196F3',
            borderRadius: '4px',
            padding: '12px',
            marginTop: '20px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <p style={{ margin: 0 }}>
              <strong>Catatan:</strong> Pengajuan ini sudah Anda proses dan disetujui. 
              Laporan telah diteruskan ke Admin Server untuk diproses lebih lanjut. 
              Anda dapat melihat status terbaru di halaman riwayat.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailSetuju;