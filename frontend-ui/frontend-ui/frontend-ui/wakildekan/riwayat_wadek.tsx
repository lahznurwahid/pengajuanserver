  "use client";

  import { useEffect, useState } from "react";
  import "./riwayat_wadek.css";
  import { FileText } from "lucide-react"; 
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

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch("/api/pengajuan", { headers });
        const result = await res.json();
        const pengajuanList = Array.isArray(result.data) ? result.data : [];

        const transformed: DisplayRiwayat[] = pengajuanList
          .map((p: Pengajuan) => {
            const persetujuanList = p.persetujuan || [];
            const kepalaLabApproved = persetujuanList.find(
              a => a.user?.role?.toUpperCase() === "KEPALA_LAB" && a.status === "DISETUJUI"
            );
            const dekanRejected = persetujuanList.find(
              a => a.user?.role?.toUpperCase() === "DEKAN" && a.status === "DITOLAK"
            );
            if (!kepalaLabApproved && !dekanRejected) return null;

            const status = getWadekRiwayatStatus(p);
            return {
              id: p.id,
              kode: `123456${p.id}`,
              layanan: p.namaSistem,
              nama: p.pemohon?.nama || p.nama || "-",
              phone: p.pemohon?.noTelepon || p.nomorTelepon || "-",
              status,
              pengajuan: p,
            };
          })
          .filter((item: DisplayRiwayat | null): item is DisplayRiwayat => item !== null);

        setAllData(transformed);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

const getWadekRiwayatStatus = (pengajuan: Pengajuan): "MENUNGGU" | "DIPROSES" | "DITOLAK" => {
  const persetujuanList = pengajuan.persetujuan || [];

  // Ditolak jika ada persetujuan DEKAN status DITOLAK
  const dekanRejected = persetujuanList.find(
    p => p.user?.role?.toUpperCase() === "DEKAN" && p.status === "DITOLAK"
  );
  if (dekanRejected) return "DITOLAK";

  // Diproses jika ada persetujuan WADEK status DISETUJUI atau DITOLAK
  const wadekProcessed = persetujuanList.find(
    p => p.user?.role?.toUpperCase().includes("WADEK") && (p.status === "DISETUJUI" || p.status === "DITOLAK")
  );
  if (wadekProcessed) return "DIPROSES";

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
      router.push(`/wakildekan/detail/${id}`);

    };
    
    function handleLogout(event: React.MouseEvent<HTMLButtonElement>): void {
      window.location.href = '/login';
      throw new Error("Function not implemented.");
    }

    return (

    <div className="staff-page">
      <div className="hider"></div>
      <header className="topbar">
        <div className="top-left">
          <div className="brand" style={{ fontSize: "24px", fontWeight: "bold" }}>Wakil Dekan</div>
          <img className="log01" src="/img/logo1.png" alt="Logo 1" />
          <img className="log02" src="/img/logo2.png" alt="Logo 2" />
        </div>

        <nav className="top-nav">
          <button onClick={() => router.push('/wakildekan')} className="nav-link active" style={{ fontWeight: 'bold'}}>Home</button>
          <button onClick={() => router.push('/wakildekan/riwayat_wadek')} className="nav-link" style={{ fontWeight: 'bold' , color: "#2e7d32"  }}>Riwayat</button>
        </nav>
        
        
        <div className="top-right">
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="riwayat-container">
        <div className="header-title-box">
          <h1>Riwayat Laporan Pengajuan</h1>
        </div>

        <div className="main-card">
          <div className="note-box">
            <p>
              <strong>Note: Anda login sebagai role Wakil Dekan. Riwayat hanya menampilkan pengajuan yang sudah disetujui Kepala Lab atau pengajuan yang ditolak oleh Dekan.</strong>
            </p>
          </div>

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
                          {item.status === "MENUNGGU" ? "menunggu" : item.status === "DIPROSES" ? "diproses" : "ditolak"}
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
    </div>
    
    );
  }