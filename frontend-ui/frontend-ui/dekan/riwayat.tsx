
"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./riwayat.css";

// Tipe data untuk laporan
interface Laporan {
  id: number;
  kode: string;
  layanan: string;
  nama: string;
  hp: string;
  status: "Menunggu" | "Disetujui";
}

const RiwayatDekan: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<Laporan[]>([]);
  const [filteredData, setFilteredData] = useState<Laporan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Dekan");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Fungsi untuk cek autentikasi
    const checkAuth = () => {
      console.log('Checking authentication...');
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const userData = localStorage.getItem('userData');

      console.log('Token:', token ? 'exists' : 'missing');
      console.log('Role:', role);


      // Ambil nama user
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.nama || 'Dekan');
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      return true;
    };

    const isAuthenticated = checkAuth();
    if (isAuthenticated) {
      loadRiwayat();
    }
    setAuthChecked(true);
  }, [router]);

  const loadRiwayat = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      console.log('Loading riwayat with token:', token ? 'exists' : 'missing');
      
      const res = await fetch('/api/dekan/riwayat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', res.status);

      if (res.status === 401) {
        console.log('Unauthorized, clearing storage and redirecting');
        localStorage.clear();
        router.push('/login');
        return;
      }

      if (!res.ok) {
        throw new Error(`Gagal memuat riwayat: ${res.status}`);
      }

      const result = await res.json();
      console.log('API Response data:', result);

      // Map data dari API ke format yang diharapkan
      const mappedData = (result.data || []).map((item: any, index: number) => ({
        id: item.id || index + 1,
        kode: item.kode || `KD${String(index + 1).padStart(3, '0')}`,
        layanan: item.judul || item.namaLayanan || '-',
        nama: item.pemohon?.nama || item.nama || '-',
        hp: item.pemohon?.noHp || item.noHp || '-',
        status: item.status === 'DISETUJUI' ? 'Disetujui' : 'Menunggu',
      }));

      setData(mappedData);
      setFilteredData(mappedData);
    } catch (error) {
      console.error('Error loading riwayat:', error);
      // Gunakan data dummy jika error
      const dummyData: Laporan[] = [
        {
          id: 1,
          kode: "1234567",
          layanan: "Penyimpanan Server Minecraft",
          nama: "Hotman Paris",
          hp: "08123456789",
          status: "Menunggu",
        },
        {
          id: 2,
          kode: "7654321",
          layanan: "Peminjaman Ruang Rapat",
          nama: "Ahmad Wijaya",
          hp: "08198765432",
          status: "Disetujui",
        },
        {
          id: 3,
          kode: "1122334",
          layanan: "Permintaan Alat Tulis",
          nama: "Siti Nurbaya",
          hp: "08122334455",
          status: "Menunggu",
        },
      ];
      setData(dummyData);
      setFilteredData(dummyData);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    let result = data;

    if (selectedStatus !== "Semua") {
      result = result.filter((item) => item.status === selectedStatus);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.nama.toLowerCase().includes(lowerSearch) ||
          item.kode.includes(lowerSearch) ||
          item.layanan.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredData(result);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("Semua");
    setFilteredData(data);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.clear();
    router.push('/login');
    router.refresh();
  };

  const handleViewDetail = (id: number, status: string) => {
    if (status === 'Disetujui') {
      router.push(`/dekan/detail_setuju/${id}`);
    } else {
      router.push(`/dekan/detail_wait/${id}`);
    }
  };

  // Tampilkan loading saat cek auth
  if (!authChecked) {
    return (
      <div className="loading-container">
        <p>Memverifikasi autentikasi...</p>
      </div>
    );
  }

  return (
    <div className="riwayat-page">
      <nav className="navbar">
        <div className="nav-brand">Dekan - {userName}</div>
        <div className="nav-menu">
          <Link 
            href="/dekan" 
            className={pathname === '/dekan' ? 'active' : ''}
          >
            Home
          </Link>
          <Link 
            href="/dekan/riwayat" 
            className={pathname === '/dekan/riwayat' ? 'active' : ''}
          >
            Riwayat
          </Link>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </nav>

      <div className="container">
        <div className="header-title-box">
          <h1>Riwayat Laporan Pengajuan</h1>
        </div>

        <div className="card">
          <div className="info-box">
            <p>
              <strong>Note:</strong> Anda Login sebagai role Dekan, Riwayat
              pengajuan hanya untuk mengetahui apakah pengajuan baru saja
              diberikan oleh Wakil Dekan yang sudah atau menunggu laporannya
              anda proses.
            </p>
          </div>

          <div className="search-row">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Masukkan Kode, Nama Layanan, Nama, No.Hp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilter()}
              />
            </div>
            <button className="btn-daftar" onClick={handleApplyFilter}>
              <Search size={18} /> Cari
            </button>
          </div>

          <div className="filter-row">

            <select 
              className="dropdown"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Semua">Status (Semua)</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Menunggu">Menunggu</option>
            </select>

            <button className="btn-reset" onClick={handleReset}>
              <RotateCcw size={16} /> Reset
            </button>
            <button className="btn-terapkan" onClick={handleApplyFilter}>
              Terapkan
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
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-detail"
                          onClick={() => handleViewDetail(item.id, item.status)}
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
                <h3>Data tidak ditemukan</h3>
                <p>Tidak ada riwayat pengajuan yang sesuai dengan filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiwayatDekan;

