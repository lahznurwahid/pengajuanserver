# Dokumentasi Integrasi Frontend dengan API - Dekan & Wakil Dekan

## Overview
Integrasi frontend untuk flow persetujuan pengajuan dari Wakil Dekan ke Dekan dengan koneksi ke database dan API yang sudah ada.

## Flow Persetujuan
```
Pemohon → Kepala Lab (DIPERIKSA) → Wakil Dekan (DISETUJUI) → Dekan (DIPROSES) → Admin Server
```

### Status di Setiap Tahap:
- **DIAJUKAN**: Pengajuan awal dari pemohon
- **DIPERIKSA**: Setelah Kepala Lab memeriksa
- **DISETUJUI**: Setelah Wakil Dekan menyetujui
- **DIPROSES**: Setelah Dekan menyetujui (diteruskan ke Admin)
- **DITERIMA**: Setelah Admin memproses

## File yang Dibuat

### 1. API Utils - `/frontend-ui/utils/api.ts`
**Fungsi:**
- Wrapper untuk API calls dengan authentication
- Helper functions untuk mengambil dan memanipulasi data pengajuan
- Filter untuk status dekan

**Export Functions:**
```typescript
// Pengajuan APIs
getPengajuanList()
getPengajuanById(id)
getPengajuanByStatus(status, filter)
getDekanPengajuan(filter)

// Persetujuan APIs
submitPersetujuan(pengajuanId, status, catatan)
getPersetujuanByPengajuanId(pengajuanId)

// Status Management
updatePengajuanStatus(id, status)

// Helpers
filterPengajuanByDekanStatus(pengajuan[], status)
```

### 2. Dekan Components

#### a) `home.tsx` - Halaman Home Dekan
**Fitur:**
- Menampilkan statistik pengajuan (menunggu persetujuan, sudah diproses)
- List pengajuan terbaru yang masuk dari Wakil Dekan
- Link ke detail pengajuan

**Data yang ditampilkan:**
- Kode/ID
- Nama sistem layanan
- Nama pemohon
- Nomor HP
- Status (Menunggu/Diproses)
- Tombol Detail

#### b) `riwayat.tsx` - Halaman Riwayat Pengajuan
**Fitur:**
- **Search Bar**: Pencarian berdasarkan Kode, Nama Layanan, Email, No.Hp
- **Date Range Filter**: Filter berdasarkan tanggal pengajuan
- **Status Filter**: Dropdown untuk filter "Menunggu" atau "Diproses"
- **Reset Button**: Menghapus semua filter
- **Detail View**: Menampilkan detail pengajuan berdasarkan status

**Status Filter:**
- **Menunggu**: Pengajuan yang belum dikonfirmasi Dekan (sudah dari Wakil Dekan tapi belum ada approve/reject dari Dekan)
- **Diproses**: Pengajuan yang sudah disetujui Dekan

#### c) `detail_wait.tsx` - Halaman Detail (Menunggu Persetujuan)
**Fitur:**
- Menampilkan informasi lengkap pengajuan dalam format read-only
- Field untuk catatan/alasan (opsional)
- **2 Tombol Aksi:**
  - **Tidak Setuju** (Reject) - Laporan diteruskan kembali ke Wakil Dekan (status: DIPERIKSA)
  - **Setuju** (Approve) - Laporan diteruskan ke Admin Server (status: DIPROSES)

**Informasi yang ditampilkan:**
- Pemohon (Nama, Jabatan, Email, No.Telepon)
- Informasi Sistem Layanan (Nama, Pemilik, Pengguna, Fungsi)
- Akses & Jaringan (Publik, Alamat, Port)
- Spesifikasi Teknis (CPU, GPU, RAM, Storage, OS, Software)

#### d) `detail_setuju.tsx` - Halaman Detail (Sudah Disetujui)
**Fitur:**
- Menampilkan informasi pengajuan dalam format read-only
- Menampilkan informasi persetujuan (Disetujui oleh, Tanggal, Catatan)
- Status badge "Sudah Anda Proses (Disetujui)"
- Tidak ada tombol aksi (view-only)

### 3. Wakil Dekan Components

#### `home-wakil.tsx` - Update untuk Flow ke Dekan
**Fitur:**
- Fetch pengajuan yang sudah dari Kepala Lab (status DIPERIKSA)
- Menampilkan statistik pengajuan
- Klik "Periksa" untuk detail view
- **Tombol Aksi di Detail:**
  - **Tidak Setuju** - Status kembali ke DIAJUKAN (kembali ke Kepala Lab)
  - **Setuju** - Status menjadi DISETUJUI (diteruskan ke Dekan)

**Integrasi API:**
- Memanggil `submitPersetujuan` saat approve/reject
- Update status dengan `updatePengajuanStatus`

## API Integration Details

### Endpoints yang Digunakan:

1. **GET /api/pengajuan**
   - Mengambil list semua pengajuan
   - Filter: search, status, tanggal
   - Response: Array of Pengajuan

2. **GET /api/pengajuan/[id]**
   - Mengambil detail pengajuan spesifik
   - Response: Pengajuan detail

3. **POST /api/persetujuan**
   - Submit persetujuan/penolakan
   - Body: 
     ```json
     {
       "pengajuanId": number,
       "status": "SETUJU" | "TOLAK",
       "catatan": string (optional)
     }
     ```

4. **PATCH /api/pengajuan/[id]/status**
   - Update status pengajuan
   - Body:
     ```json
     {
       "status": "DIAJUKAN" | "DIPERIKSA" | "DISETUJUI" | "DIPROSES"
     }
     ```

## Data Flow

### Saat Wakil Dekan Setuju:
1. Klik "Periksa" di list pengajuan
2. Tampilkan detail dengan form
3. Klik "Setuju" dan isi catatan (opsional)
4. API Call:
   - POST `/api/persetujuan` dengan status "SETUJU"
   - PATCH `/api/pengajuan/[id]/status` dengan status "DISETUJUI"
5. Refresh list, pengajuan hilang dari list Wakil Dekan
6. Muncul di list Dekan dengan status "Menunggu"

### Saat Dekan Setuju:
1. Akses `/dekan/riwayat` dengan status "Menunggu"
2. Klik "Detail" pada pengajuan
3. Tampilkan form `detail_wait.tsx`
4. Klik "Setuju":
   - POST `/api/persetujuan` dengan status "SETUJU"
   - PATCH `/api/pengajuan/[id]/status` dengan status "DIPROSES"
5. Pengajuan pindah ke "Diproses" dan form menjadi `detail_setuju.tsx` (read-only)

### Saat Dekan Tolak:
1. Sama seperti Setuju, tapi klik "Tidak Setuju"
2. POST `/api/persetujuan` dengan status "TOLAK"
3. PATCH dengan status "DIPERIKSA" (kembali ke setelah Kepala Lab)
4. Pengajuan dikembalikan ke Wakil Dekan

## CSS Styling

Semua komponen memiliki styling yang konsisten:
- Material Design inspired
- Responsive design (mobile-friendly)
- Color scheme:
  - Primary: #2196F3 (Blue)
  - Success: #4CAF50 (Green)
  - Warning: #FBC02D (Yellow)
  - Error: #F44336 (Red)
  - Info: #E3F2FD (Light Blue)

## Catatan Penting

1. **Authentication**: Semua API calls menggunakan token dari session
2. **Status Management**: Perubahan status harus konsisten dengan flow yang didesain
3. **Validasi**: Backend API sudah melakukan validasi status transitions
4. **Error Handling**: Setiap API call memiliki error handling dan user feedback
5. **Loading State**: Tombol dan input di-disable saat request sedang diproses

## Testing Checklist

- [ ] Wakil Dekan bisa melihat pengajuan dari Kepala Lab
- [ ] Wakil Dekan bisa approve (pengajuan pindah ke Dekan)
- [ ] Wakil Dekan bisa reject (pengajuan kembali ke Kepala Lab)
- [ ] Dekan bisa melihat pengajuan yang disetujui Wakil Dekan
- [ ] Dekan bisa approve (status DIPROSES, dikirim ke Admin)
- [ ] Dekan bisa reject (status kembali DIPERIKSA, kembali ke Wakil Dekan)
- [ ] Filter dan search berfungsi dengan baik
- [ ] Responsif di mobile
- [ ] Error messages ditampilkan dengan baik
