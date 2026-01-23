# Proyek Soundpub - TODO List

Dokumen ini melacak kemajuan pengembangan dan rencana masa depan untuk proyek Soundpub.

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
- [ ] **Manajemen Urutan Kategori:** Implementasikan fungsionalitas drag-and-drop untuk mengurutkan kategori itu sendiri.
- [ ] **Fitur "Populer":** Tambahkan checkbox "Jadikan Populer" di form edit paket untuk menyorot paket tertentu di halaman publik.
- [ ] **Manajemen Pengguna (User Roles):**
  - [ ] Buat halaman untuk mengelola pengguna admin.
  - [ ] Kembangkan sistem peran (misal: Super Admin vs. Editor Konten) untuk membatasi akses.
- [ ] **Analitik Sederhana:** Tampilkan grafik atau data sederhana di halaman utama dashboard (misalnya: jumlah paket, jumlah kategori).
- [ ] **Manajemen Halaman Lain:** Buat modul serupa (CRUD) untuk mengelola konten halaman lain (misal: Blog, Services).
- [ ] **Penyimpanan Gambar:** Integrasikan Supabase Storage untuk mengunggah gambar atau thumbnail untuk setiap paket layanan.

### Peningkatan Frontend
- [ ] **Terapkan Fitur "Populer":** Desain ulang `PricingCard` untuk memberikan gaya visual yang berbeda jika sebuah paket ditandai sebagai "populer".
- [ ] **Halaman Blog Dinamis:** Buat halaman `/blog` sepenuhnya dinamis, dikelola dari dashboard.
- [ ] **Optimasi Performa:**
  - [ ] Implementasikan *caching* data dengan React Query (`@tanstack/react-query`) untuk mengurangi panggilan database yang berulang.
  - [ ] Optimasi gambar untuk mempercepat waktu muat halaman.
- [ ] **Formulir Kontak/Kolaborasi:** Buat formulir di halaman `/kolaborasi` yang datanya akan disimpan ke tabel Supabase.
- [ ] **Pencarian:** Tambahkan fungsionalitas pencarian untuk katalog atau blog.

### Peningkatan Teknis & Keamanan
- [ ] **Pengujian (Testing):** Tambahkan unit test untuk fungsi-fungsi kritis dan E2E (End-to-End) test untuk alur utama seperti login dan CRUD.
- [ ] **CI/CD Pipeline:** Siapkan alur kerja (workflow) GitHub Actions atau sejenisnya untuk otomatisasi testing dan deployment.
- [ ] **Supabase Edge Functions:** Pindahkan logika yang sensitif atau memerlukan komputasi berat ke Supabase Edge Functions untuk keamanan dan performa yang lebih baik.
- [ ] **Validasi Input (Form):** Implementasikan validasi form yang lebih kuat menggunakan library seperti `Zod` dan `react-hook-form`.
