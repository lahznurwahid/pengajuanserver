"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./riwayat.css";

interface Laporan {
  id: number;
  kode: string;
  layanan: string;
  nama: string;
  hp: string;
  status: string;
  tanggal: string;
}

const RiwayatDekan: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<Laporan[]>([]);
  const [filteredData, setFilteredData] = useState<Laporan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setAuthChecked(true);
    loadRiwayat();
  }, []);

  // Filter otomatis setiap kali searchTerm, selectedStatus, atau data berubah
  useEffect(() => {
    let result = data;

    if (selectedStatus !== "Semua") {
      result = result.filter((item) => item.status === selectedStatus);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.nama.toLowerCase().includes(lowerSearch) ||
          item.kode.toLowerCase().includes(lowerSearch) ||
          item.layanan.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredData(result);
  }, [selectedStatus, searchTerm, data]);

  const loadRiwayat = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/pengajuan', { headers });

      if (res.status === 401) {
        localStorage.clear();
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error(`Gagal memuat data: ${res.status}`);

      const result = await res.json();
      const allData = result.data || [];

      const relevantStatuses = ['DISETUJUI', 'DIPROSES', 'DITOLAK', 'SELESAI'];
      const filtered = allData.filter((item: any) =>
        relevantStatuses.includes(item.status)
      );

      const mappedData: Laporan[] = filtered.map((item: any) => ({
        id: item.id,
        kode: `KD${String(item.id).padStart(3, '0')}`,
        layanan: item.namaSistem || item.judul || '-',
        nama: item.pemohon?.nama || item.nama || '-',
        hp: item.pemohon?.noTelepon || item.nomorTelepon || '-',
        status: mapStatus(item.status),
        tanggal: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('id-ID')
          : '-',
      }));

      setData(mappedData);
    } catch (error) {
      console.error('Error loading riwayat:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (status: string): string => {
    switch (status) {
      case 'DISETUJUI': return 'Menunggu Keputusan';
      case 'DIPROSES':  return 'Disetujui';
      case 'DITOLAK':   return 'Ditolak';
      case 'SELESAI':   return 'Selesai';
      default:          return status;
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("Semua");
    // filteredData otomatis direset oleh useEffect
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
    router.refresh();
  };

  const handleViewDetail = (id: number) => {
    router.push(`/dekan/detail/${id}`);
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'Menunggu Keputusan': return 'menunggu';
      case 'Disetujui':          return 'disetujui';
      case 'Ditolak':            return 'ditolak';
      case 'Selesai':            return 'selesai';
      default:                   return '';
    }
  };

  if (!authChecked) {
    return (
      <div className="loading-container">
        <p>Memverifikasi autentikasi...</p>
      </div>
    );
  }

  return (
    <div className="staff-page">
      <div className="hider"></div>
      <header className="topbar">
        <div className="top-left">
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold" }}>Dekan</div>
          <img className="log01" src="/img/logo1.png" alt="Logo 1" />
          <img className="log02" src="/img/logo2.png" alt="Logo 2" />
        </div>

        <div className="nav-menu">
          <Link href="/dekan" className={pathname === '/dekan' ? 'active' : ''}>
            Home
          </Link>
          <Link href="/dekan/riwayat" className={pathname === '/dekan/riwayat' ? 'active' : ''}>
            Riwayat
          </Link>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="container">
        <div className="header-title-box">
          <h1>Riwayat Laporan Pengajuan</h1>
        </div>

        <div className="card">
          <div className="info-box">
            <p>
              <strong>Note:</strong> Anda Login sebagai role Dekan. Riwayat
              pengajuan menampilkan semua pengajuan yang sudah sampai ke tahap
              Dekan — baik yang menunggu keputusan, sudah disetujui, maupun
              yang ditolak.
            </p>
          </div>

          <div className="search-row">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Masukkan Kode, Nama Layanan, Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-row">
            <select
              className="dropdown"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Semua">Status (Semua)</option>
              <option value="Menunggu Keputusan">Menunggu Keputusan</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
              <option value="Selesai">Selesai</option>
            </select>

            <button className="btn-reset" onClick={handleReset}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-state">
                <p>Memuat data...</p>
              </div>
            ) : filteredData.length > 0 ? (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Kode/ID</th>
                    <th>Nama Layanan</th>
                    <th>Nama</th>
                    <th>No.Hp</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}.</td>
                      <td>{item.kode}</td>
                      <td>{item.layanan}</td>
                      <td>{item.nama}</td>
                      <td>{item.hp}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-detail"
                          onClick={() => handleViewDetail(item.id)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon-wrapper">
                  <FileText size={60} strokeWidth={1.5} />
                </div>
                <h3>
                  {data.length === 0
                    ? "Belum ada pengajuan yang sampai ke tahap Dekan."
                    : "Tidak ada pengajuan yang sesuai dengan filter."}
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiwayatDekan;