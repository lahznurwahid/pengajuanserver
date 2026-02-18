  "use client";

  import { useEffect, useState } from "react";
  import "./riwayat_kelab.css";
  import { Search, RotateCcw, FileText, AlertCircle } from "lucide-react"; 
  import { useRouter } from "next/navigation";

  //--- Pengajuan dan Riwayat Types ---//

  type Pengajuan = {
    id: number;
    namaSistem: string;
    nama?: string;
    nomorTelepon?: string;
    pemohon?: {
      id: number;
      nama: string;
      noTelepon?: string;
    };
    persetujuan?: Array<{
      id: number;
      status: string;
      catatan?: string;
      tanggal: string;
      user: {
        id: number;
        nama: string;
        role: string;
      };
    }>;
  };

  type DisplayRiwayat = {
    id: number;
    kode: string;
    layanan: string;
    nama: string;
    phone: string;
    status: "MENUNGGU" | "DIPROSES" | "DITOLAK";
    pengajuan: Pengajuan;
  };

  //--- Memeriksa Riwayat pengajuan ---//

  export default function RiwayatPage() {
    const [filterStatus, setFilterStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [allData, setAllData] = useState<DisplayRiwayat[]>([]);
    const [filteredData, setFilteredData] = useState<DisplayRiwayat[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
      fetchData();
    }, []);

    useEffect(() => {
      filterData();
    }, [filterStatus, searchTerm, allData]);

    const getToken = () => {
      if (typeof window === "undefined") return null;
      return localStorage.getItem("token");
    };

  //--- Transfromasi dan mengambil data pengajuan dari API ---//

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch("/api/pengajuan", { headers });
        const result = await res.json();
        const pengajuanList = Array.isArray(result.data) ? result.data : [];

        const transformed = pengajuanList.map((p: Pengajuan) => ({
          id: p.id,
          kode: `123456${p.id}`, // Simulasi kode seperti di figma
          layanan: p.namaSistem,
          nama: p.pemohon?.nama || p.nama || "-",
          phone: p.pemohon?.noTelepon || p.nomorTelepon || "-",
          status: getKepalaLabStatus(p),
          pengajuan: p,
        }));

        setAllData(transformed);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

const getKepalaLabStatus = (pengajuan: Pengajuan): "MENUNGGU" | "DIPROSES" | "DITOLAK" => {
  const persetujuanList = pengajuan.persetujuan || [];
  const wadekRejection = persetujuanList.find(
    p => p.user?.role?.toUpperCase() === "WADEK" && p.status === "DITOLAK"
  );
  if (wadekRejection) return "DITOLAK";

  const kepalaLabDecision = persetujuanList.find(
    p => p.user?.role?.toUpperCase() === "KEPALA_LAB" && (p.status === "DISETUJUI" || p.status === "DITOLAK")
  );
  if (kepalaLabDecision) return "DIPROSES";

  return "MENUNGGU";
};

    const filterData = () => {
      let temp = [...allData];
      if (filterStatus) temp = temp.filter(item => item.status === filterStatus);
      if (searchTerm) {
        temp = temp.filter(item => 
          item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.layanan.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredData(temp);
    };

    const handleGoToDetail = (id: number) => {
        // route under app is `/kelab`, so navigate to `/kelab/detail/[id]`
        router.push(`/kelab/detail/${id}`);

    };
    
    return (
      <div className="riwayat-container">
        {/* Header Title Box */}
        <div className="header-title-box">
          <h1>Riwayat Laporan Pengajuan</h1>
        </div>

        <div className="main-card">
          {/* Note Box */}
          <div className="note-box">
            <p>
              <strong>Note: Anda Login sebagai role Kepala Lab, Riwayat pengajuan hanya untuk mengetahui apakah pengajuan ditolak oleh Wakil Dekan atau pengajuan baru saja diberikan oleh Pemohon yang sudah atau menunggu laporannya anda proses.</strong>
            </p>
          </div>

          {/* Filter Bar */}
          <div className="search-filter-section">
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder="Masukkan Kode, Nama Layanan, Email, No.Hp untuk mencari..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn-search">
                Daftar Pengajuan
              </button>
            </div>

            <div className="filter-actions">
              <select className="select-custom" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Status</option>
                <option value="MENUNGGU">Menunggu</option>
                <option value="DIPROSES">Diproses</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
              
              <button className="btn-reset" onClick={() => {setFilterStatus(""); setSearchTerm("");}}>
                Reset
              </button>
              <button className="btn-terapkan" onClick={fetchData}>
                Terapkan
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">Memuat data...</div>
            ) : filteredData.length === 0 ? (
              <div className="no-data-found">
                  <div className="icon-no-data">
                      <FileText size={48} color="#ccc" />
                      <span className="x-mark">×</span>
                  </div>
                  <p>Data tidak ditemukan</p>
              </div>
            ) : (
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
                      <td>{item.phone}</td>
                      <td>
                        <span className={`status-text ${item.status.toLowerCase()}`}>
                          {item.status === "MENUNGGU" ? "menunggu" : 
                          item.status === "DIPROSES" ? "diproses" : "ditolak"}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-detail-action"
                          onClick={() => handleGoToDetail(item.id)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }