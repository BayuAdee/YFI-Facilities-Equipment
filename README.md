# Facilities & Equipment Monitoring System (FEMS)
**PT. Yahata Fastener Indonesia**

Sistem informasi berbasis web yang dirancang untuk mendigitalkan proses pemantauan, patroli, dan inspeksi berkala fasilitas keselamatan kerja (K3) serta peralatan industri—seperti Alat Pemadam Api Ringan (APAR), Hydrant, dan sarana darurat lainnya—menggunakan teknologi QR Code.

---

## 📌 Fitur Utama

### 1. Dashboard Monitoring Real-Time
- **Statistik Kesehatan Fasilitas**: Ringkasan status unit terkini:
  - **Kondisi OK / Normal**: Alat siap pakai dan telah diperiksa sesuai jadwal.
  - **Perlu Tindak Lanjut / Temuan Rusak**: Alat yang mengalami kerusakan atau temuan checklist tidak sesuai.
  - **Terlambat / Overdue**: Alat yang telah melewati batas periode inspeksi berkala.
  - **Kedaluwarsa / Expired**: Tabung/alat yang telah mendekati atau melewati batas masa berlaku (*expiry date*).
- **Pencarian & Filter Cepat**: Filter berdasarkan status, kode alat, nama area, dan catatan penempatan.
- **Tindak Lanjut & Selesai Perbaikan**: Modal interaktif untuk melihat catatan temuan kerusakan dan menandai alat telah diperbaiki (*resolve repair*) langsung dari dashboard.

### 2. Inspeksi Lapangan Berbasis QR Code
- **Kamera QR Scanner Terintegrasi**: Petugas dapat langsung memindai stiker barcode/QR yang tertempel pada fisik alat menggunakan kamera smartphone maupun webcam laptop.
- **Formulir Checklist Dinamis**: Item pemeriksaan fisik (tekanan manometer, selang, pin pengaman, segel, korosi, dll.) disesuaikan secara otomatis berdasarkan jenis alat.
- **Bukti Foto & Catatan Temuan**: Mendukung pengambilan foto kondisi lapangan dan catatan wajib jika ditemukan ketidaksesuaian.
- **Validasi Integritas**: Hasil inspeksi langsung memperbarui status alat dan jadwal inspeksi berikutnya secara otomatis.

### 3. Portal Informasi Publik Per Unit Alat
- **Akses Cepat Tanpa Login**: Setiap stiker QR memiliki token unik publik (`/a/{token}`). Siapa pun di area pabrik dapat memindai alat untuk melihat spesifikasi, lokasi penempatan, dan riwayat inspeksi terakhir.
- **Tombol Mulai Inspeksi**: Petugas yang telah login dapat langsung masuk ke formulir checklist dari halaman publik tersebut.

### 4. Modul Administrasi & Manajemen Data (Admin Only)
- **Daftar Alat**:
  - Pendaftaran alat baru dengan kode inventaris unik.
  - Unduh label / stiker QR Code siap cetak.
  - Reset QR token jika stiker fisik rusak/hilang.
  - Nonaktifkan / Afkir (*soft delete*) unit rusak berat dengan tetap menjaga keutuhan riwayat inspeksi masa lalu untuk kebutuhan audit K3.
  - Pemulihan (*restore*) alat yang diarsipkan kembali ke daftar aktif.
- **Master Area & Jenis Alat**:
  - Konfigurasi master zona/lokasi (Gedung, Workshop, Gudang, Kantor).
  - Konfigurasi tipe peralatan beserta siklus hari patroli rutin (misal: 30 hari).
  - Proteksi integritas referensi data: area tidak dapat dihapus jika masih digunakan oleh unit alat aktif.
- **Master Poin Checklist K3**: Pengaturan pertanyaan inspeksi (tipe Yes/No, angka, teks) dan nilai parameter normal (*OK value*).
- **Manajemen Pengguna & Petugas**: Pengaturan akun admin dan petugas inspeksi K3, aktivasi/nonaktivasi akun.

### 5. Pengalaman Antarmuka (UI/UX)
- **Tampilan Desktop**: Navigasi sidebar samping (*sidebar*) yang nyaman untuk pemantauan monitor kantor.
- **Tampilan Mobile**: Navigasi bawah (*Bottom Navigation Bar*) dan header minimalis yang dioptimalkan untuk pengoperasian dengan satu tangan di lapangan.
- **Floating Toast Notification**: Notifikasi popup melayang di pojok kanan atas (desktop) dan atas (mobile) yang otomatis hilang dalam 3,5 detik tanpa menggeser tata letak elemen di bawahnya.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

- **Backend**: [Laravel 12](https://laravel.com/) (PHP 8.3)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Frontend**: [React 18](https://react.dev/) + [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icon Set**: [Lucide React / React Icons](https://react-icons.github.io/react-icons/)
- **QR Scanner**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) & [qrcode.react](https://github.com/zpao/qrcode.react)
- **Build Tool**: [Vite](https://vite.dev/)

---

## 🔐 Akun Demo / Bawaan

Sistem telah dilengkapi data seeder bawaan untuk mempermudah pengujian:

| Peran (Role) | Email / Username | Kata Sandi | Hak Akses |
|---|---|---|---|
| **Administrator** | `admin@safecheck.local` | `password` | Akses penuh dashboard, manajemen alat, master data, dan kelola petugas |
| **Petugas K3** | `petugas@safecheck.local` | `password` | Akses dashboard operasional, scan QR, dan pengisian formulir inspeksi |

> *Tips: Pada halaman login, tersedia tombol **Akun Demo Cepat** untuk mengisi kredensial dengan satu kali klik.*

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
- PHP >= 8.3
- Composer >= 2.x
- Node.js >= 18.x & NPM
- PostgreSQL Server

### 2. Langkah Instalasi

1. **Clone Repositori**:
   ```bash
   git clone <url-repositori-anda>
   cd SC-yahata
   ```

2. **Instal Dependensi PHP & JavaScript**:
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin template `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan sesuaikan koneksi database PostgreSQL Anda:
   ```env
   APP_NAME="Facilities & Equipment Monitoring System"
   APP_URL=http://localhost:8000

   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5433
   DB_DATABASE=Yahata-check
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   ```

4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

5. **Migrasi Database & Seeder**:
   ```bash
   php artisan migrate:fresh --seed
   ```

6. **Buat Symlink Storage (untuk upload foto inspeksi)**:
   ```bash
   php artisan storage:link
   ```

7. **Kompilasi Aset Frontend**:
   - Untuk mode pengembangan (*live reload*):
     ```bash
     npm run dev
     ```
   - Untuk mode produksi:
     ```bash
     npm run build
     ```

8. **Jalankan Web Server**:
   ```bash
   php artisan serve
   ```
   Buka browser dan akses: `http://localhost:8000`

---

## 🧪 Pengujian Otomatis

Aplikasi dilengkapi unit dan feature test untuk menjamin stabilitas endpoint:
```bash
php artisan test --compact
```
Atau menggunakan PHPUnit langsung:
```bash
vendor/bin/phpunit
```

---

## 📂 Struktur Direktori Utama

```
SC-yahata/
├── app/
│   ├── Http/Controllers/Api/   # Controller REST API (Asset, Inspection, Admin, Auth)
│   └── Models/                 # Eloquent Model (Asset, Inspection, Area, AssetType, User)
├── database/
│   ├── migrations/             # Skema tabel database PostgreSQL
│   └── seeders/                # Seeder data awal (SafeCheckSeeder)
├── resources/
│   ├── js/
│   │   ├── api/                # Konfigurasi Axios client & interceptor
│   │   ├── components/
│   │   │   ├── Layout/         # Sidebar, BottomNav, MobileHeader, Shell
│   │   │   └── UI/             # StatusBadge, QrScannerModal, LoadingSpinner
│   │   ├── context/            # ToastContext (sistem notifikasi floating popup)
│   │   ├── pages/              # Dashboard, Admin, Inspection, PublicAsset, Login
│   │   ├── app.jsx             # React root mount
│   │   └── MainApp.jsx         # Router & Route guards
│   └── views/
│       └── app.blade.php       # Layout HTML Blade utama
├── routes/
│   └── api.php                 # Rute REST API
└── tests/
    └── Feature/                # Automated testing
```

---

## 📄 Lisensi

Dikembangkan untuk kebutuhan operasional internal **PT. Yahata Fastener Indonesia**.
