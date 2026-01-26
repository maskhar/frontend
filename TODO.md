# Proyek Soundpub - TODO List

## 🛠️ Perbaikan Bug & Stabilitas
- [x] **Perbaikan Migrasi Database:** Membuat semua file migrasi (01-07) menjadi idempoten (aman dijalankan ulang) untuk menyelesaikan masalah sinkronisasi database `supabase db push`.
- [x] **Perbaikan Alur Data Kontrak:** Memperbaiki logika `PlanFormDialog` dan `DashboardContractPage` untuk menangani data relasional `category_id` dengan benar, menyelesaikan masalah di mana data tidak tersimpan.
- [x] **Perbaikan State Management:** Menyelesaikan bug di mana state 'edit' tetap tersangkut saat beralih ke mode 'tambah baru' di semua halaman dashboard.
- [x] **Perbaikan RLS (Row Level Security):** Menambahkan kebijakan keamanan eksplisit untuk admin pada tabel `plans` dan `service_items` untuk memperbaiki error `violates row-level security policy`.
- [x] **Perbaikan Render Loop:** Mengatasi *race condition* render di React dengan merestrukturisasi `App.tsx`, `main.tsx`, dan `sonner.tsx` untuk mencegah error `Cannot update a component while rendering...`.

## ✅ Selesai (V1)

### Fondasi & Infrastruktur
- [x] Inisialisasi proyek dengan React, Vite, TypeScript, dan Tailwind CSS.
- [x] Konfigurasi Supabase client dengan environment variables yang aman.
- [x] Migrasi database awal untuk menyimpan data paket layanan (`plans`).
- [x] Struktur database ditingkatkan dengan tabel relasional untuk kategori (`categories`).
- [x] Implementasi RLS (Row Level Security) untuk mengamankan data di Supabase.

### Fitur Dashboard (Admin)
- [x] Membuat sistem otentikasi (login/logout) untuk admin.
- [x] Membuat layout dashboard yang responsif dengan sidebar.
- [x] **Manajemen Kategori:**
  - [x] Tambah, Edit, Hapus kategori layanan.
- [x] **Manajemen Paket Layanan:**
  - [x] Tambah, Edit, Hapus paket layanan.
  - [x] Menampilkan paket dalam kelompok berdasarkan kategori.
  - [x] Implementasi pengurutan paket menggunakan antarmuka drag-and-drop.

### Fitur Frontend (Publik)
- [x] Halaman `/contract` diubah menjadi sepenuhnya dinamis, mengambil data dari Supabase.
- [x] Kategori dan paket layanan ditampilkan sesuai urutan yang diatur di dashboard.
- [x] Menampilkan skeleton loader saat data sedang dimuat untuk UX yang lebih baik.

---

## 🚀 Rencana Pengembangan Selanjutnya (V2 dan Seterusnya)

### Peningkatan Dashboard
- [ ] **Rombak Manajemen Kontrak ke Tampilan Kanban:**
  - [ ] Ubah `PlanManager` menjadi *board* dengan kategori sebagai kolom.
  - [ ] Implementasikan DND untuk mengurutkan paket di dalam kategori.
  - [ ] Implementasikan DND untuk memindahkan paket antar kategori.
  - [ ] Implementasikan DND untuk mengurutkan kolom kategori itu sendiri.
- [ ] **Fitur Duplikat Paket & Kategori:**
    - [ ] Tambahkan tombol "Duplikat" di sebelah setiap item.
    - [ ] Buat fungsi untuk menyalin item dengan "- Copy" ditambahkan di namanya.
- [ ] **Manajemen Status (Aktif/Nonaktif):**
    - [ ] Tambahkan kolom `status` di tabel `plans` dan `categories`.
    - [ ] Tambahkan tombol *toggle* di UI dashboard untuk mengubah status.
- [ ] **Fitur "Populer":** Tambahkan checkbox "Jadikan Populer" di form edit paket untuk menyorot paket tertentu di halaman publik.
- [x] **Manajemen Pengguna (User Roles):**
  - [ ] Buat halaman untuk mengelola pengguna admin.
  - [ ] Kembangkan sistem peran (misal: Super Admin vs. Editor Konten) untuk membatasi akses.
- [ ] **Analitik Sederhana:** Tampilkan grafik atau data sederhana di halaman utama dashboard (misalnya: jumlah paket, jumlah kategori).
- [x] **Manajemen Halaman Lain:** Buat modul serupa (CRUD) untuk mengelola konten halaman lain (misal: Blog, Services).
  - [x] Manajemen Service Grid (dengan unggah gambar)
  - [x] Perbaikan bug pengurutan ulang layanan utama dan langkah "Cara Kerja" di halaman manajemen layanan.
- [x] **Penyimpanan Gambar:** Integrasikan Supabase Storage untuk mengunggah gambar/thumbnail untuk `service_items` (Service Grid).

### Peningkatan Frontend
- [ ] **Filter Konten Aktif:**
  - [ ] Saring data di halaman publik (`/contract`, `/services`) untuk hanya menampilkan kategori dan paket yang berstatus "aktif".
  - [ ] Sembunyikan kategori "Uncategorized" dari halaman publik.
- [ ] **Implementasi Desain UI Halaman Kolaborasi:** Terapkan desain visual baru untuk halaman `/kolaborasi` sesuai mockup (`kolaborasi-update.png`).
- [ ] **Formulir Kontak/Kolaborasi:** Buat formulir di halaman `/kolaborasi` yang datanya akan disimpan ke tabel Supabase.
- [x] **Pembaruan Desain Halaman Layanan:** Tingkatkan desain halaman `/contract` (Services) agar sesuai dengan mockup (`services-template.png`), termasuk bagian grid layanan, booking session, Music Studio, dan Music Class.
  - [x] Manajemen bagian grid layanan (Service Grid) sudah diimplementasikan.
  - [x] Fungsionalitas pengurutan ulang (drag-and-drop) untuk layanan utama dan langkah "Cara Kerja" berfungsi dengan benar.
- [ ] **Terapkan Fitur "Populer":** Desain ulang `PricingCard` untuk memberikan gaya visual yang berbeda jika sebuah paket ditandai sebagai "populer".
- [x] **Validasi Input (Form)::** Implementasikan validasi form yang lebih kuat menggunakan library seperti `Zod` dan `react-hook-form`.
- [ ] **Halaman Blog Dinamis:** Buat halaman `/blog` sepenuhnya dinamis, dikelola dari dashboard.
- [ ] **Optimasi Performa:**
  - [ ] Implementasikan *caching* data dengan React Query (`@tanstack/react-query`) untuk mengurangi panggilan database yang berulang.
  - [ ] Optimasi gambar untuk mempercepat waktu muat halaman.
- [ ] **Pencarian:** Tambahkan fungsionalitas pencarian untuk katalog atau blog.

### Peningkatan Teknis & Keamanan
- [ ] **Implementasi Hapus Aman untuk Kategori:**
  - [ ] Buat kategori "Uncategorized" secara otomatis dengan status "nonaktif".
  - [ ] Buat Supabase Function untuk memindahkan paket ke "Uncategorized" dan menyetel statusnya menjadi "nonaktif" saat kategori induknya dihapus.
- [ ] **Pengujian (Testing):** Tambahkan unit test untuk fungsi-fungsi kritis dan E2E (End-to-End) test untuk alur utama seperti login dan CRUD.
- [ ] **CI/CD Pipeline:** Siapkan alur kerja (workflow) GitHub Actions atau sejenisnya untuk otomatisasi testing dan deployment.
- [ ] **Supabase Edge Functions:** Pindahkan logika yang sensitif atau memerlukan komputasi berat ke Supabase Edge Functions untuk keamanan dan performa yang lebih baik.

