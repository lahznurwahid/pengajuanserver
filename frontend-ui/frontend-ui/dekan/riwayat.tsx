import React, { useState } from "react";
import { Search, RotateCcw, FileText, Info, LogOut, XCircle } from "lucide-react";
import "/riwayat.css";

// Tipe data untuk laporan
interface Laporan {
  id: number;
  kode: string;
  layanan: string;
  nama: string;
  hp: string;
  status: "Menunggu" | "Disetujui";
}

// Data Dummy (Nanti diganti API)
const initialData: Laporan[] = [
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

const Riwayat: React.FC = () => {
  // State untuk data dan filter
  const [data, setData] = useState<Laporan[]>(initialData);
  const [filteredData, setFilteredData] = useState<Laporan[]>(initialData);
  
  // State input
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");

  // Logic Filter (Dijalankan saat tombol 'Terapkan' diklik atau Search berubah)
  const handleApplyFilter = () => {
    let result = data;

    // 1. Filter by Status
    if (selectedStatus !== "Semua") {
      result = result.filter((item) => item.status === selectedStatus);
    }

    // 2. Filter by Search (Otomatis jalan juga)
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

  // Logic Reset
  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("Semua");
    setFilteredData(initialData);
  };

  return (
    <div className="riwayat-page">
      {/* Navbar Sederhana */}
      <nav className="navbar">
        <div className="nav-brand">( Dekan )</div>
        <div className="nav-menu">
          <a href="/home">Home</a>
          <a href="/riwayat" className="active">Riwayat</a>
        </div>
        <button className="btn-logout"><LogOut size={16} /> Logout</button>
      </nav>

      <div className="container">
        {/* Header Title */}
        <div className="header-title-box">
          <h1>Riwayat Laporan Pengajuan</h1>
        </div>

        {/* Content Card */}
        <div className="card">
          {/* Note Box */}
          <div className="info-box">
            <p>
              <strong>Note:</strong> Anda Login sebagai role Dekan, Riwayat
              pengajuan hanya untuk mengetahui apakah pengajuan baru saja
              diberikan oleh Wakil Dekan yang sudah atau menunggu laporannya
              anda proses.
            </p>
          </div>

          {/* Search Bar Row */}
          <div className="search-row">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Masukkan Kode, Nama Layanan, Email, No.Hp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-daftar" onClick={handleApplyFilter}>
              <Search size={18} /> Daftar Pengajuan
            </button>
          </div>

          {/* Filter Controls Row */}
          <div className="filter-row">
            {/* Tanggal (Visual Only) */}
            <select className="dropdown" disabled>
              <option>Tanggal</option>
            </select>

            {/* Status Filter */}
            <select 
              className="dropdown"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Semua">Status (Semua)</option>
              <option value="Disetujui">Setujui</option>
              <option value="Menunggu">Menunggu</option>
            </select>

            {/* Tombol Aksi */}
            <button className="btn-reset" onClick={handleReset}>
              <RotateCcw size={16} /> Reset
            </button>
            <button className="btn-terapkan" onClick={handleApplyFilter}>
              Terapkan
            </button>
          </div>

          {/* Table Section */}
          <div className="table-wrapper">
            {filteredData.length > 0 ? (
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
                          {item.status === "Disetujui" ? "disetujui" : "menunggu"}
                        </span>
                      </td>
                      <td>
                        <button className="btn-detail">Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Empty State (Sesuai Desain "ATAU") */
              <div className="empty-state">
                <div className="empty-icon-wrapper">
                   <FileText size={60} strokeWidth={1.5} />
                   <XCircle className="x-badge" size={24} fill="#D32F2F" color="white" />
                </div>
                <h3>Data tidak ditemukan</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Riwayat;