# Project TODO List

Dokumen ini merangkum status implementasi fitur-fitur utama aplikasi.

## ✅ **Fase 1: Perbaikan Aliran Data & Fungsionalitas Dasar (SELESAI)**

- [x] Mendiagnosis masalah awal (halaman blank, error `getUrl`, dll.).
- [x] Mengidentifikasi arsitektur yang benar: Frontend memanggil Edge Function yang sudah ada di Proyek B.
- [x] Menghapus kebijakan RLS publik yang salah dari Proyek B.
- [x] Memperbaiki `KatalogPage.tsx` untuk menggunakan `fetch` ke endpoint Proyek B dengan otentikasi `apikey` yang benar.
- [x] Memastikan data berhasil ditampilkan di halaman katalog.

## ✅ **Fase 2: Peningkatan UI/UX & Fitur Lanjutan (SELESAI)**

Fase ini berfokus pada peningkatan pengalaman pengguna, skalabilitas, dan fungsionalitas katalog.

- [x] Mengimplementasikan tata letak dua kolom (detail & grid) yang terinspirasi dari aplikasi musik modern.
- [x] Membuat tata letak sepenuhnya responsif untuk desktop, tablet, dan mobile.
- [x] Mengimplementasikan kolom detail rilisan yang *sticky* di desktop.
- [x] Mengimplementasikan pemutar musik global dengan `PlayerContext` (state terpusat untuk `playlist`, `nowPlaying`, `isPlaying`, dll.).
- [x] Membuat komponen pemutar bawah (`Player.tsx`) dengan kontrol Play/Pause, Next/Prev, Shuffle, Repeat, Volume, Progress Bar.
- [x] Mengimplementasikan `NowPlayingSheet` untuk tampilan pemutar layar penuh di mobile, dipicu dari mini player.
- [x] Mengimplementasikan paginasi dengan *Infinite Scroll* untuk menangani katalog musik yang besar, mengambil data secara bertahap saat pengguna men-*scroll*.
- [x] Menerapkan keamanan audio dasar (sembunyikan URL asli dengan Blob, nonaktifkan klik kanan).
- [x] Menampilkan judul dinamis yang menghitung jumlah total rilisan.
- [x] Memperbaiki *bug* rendering (kesalahan `ReferenceError` ikon, `Navbar` tertutup, kolom detail hilang).

## 🔜 **Fase 3: Fitur Tambahan & Penyempurnaan (Dalam Proses)**

Fokus pada peningkatan fungsionalitas dan UX katalog.

*   [ ] **Pencarian & Filter:** Mengimplementasikan fungsionalitas pencarian teks dan filter berdasarkan genre.
*   [ ] **URL Slug:** Mengganti ID di URL (`/katalog/:releaseId`) dengan nama rilisan yang lebih ramah SEO (misalnya, `/katalog/nama-album-keren`).
*   [ ] **Tampilkan Badge "Explicit":** Menampilkan penanda visual (misalnya, ikon E) untuk lagu dengan `explicit_lyrics`.
*   [ ] **Optimasi Performa:** Memastikan pengambilan data efisien, terutama saat *scrolling*.

## ⏳ **Fase 4: Pembangunan UI Manajemen Musik di Dashboard (Belum Dimulai)**

Fokus pada fungsionalitas admin/pengelolaan.

*   [ ] Merancang dan membuat komponen UI baru untuk halaman manajemen musik di dashboard.
*   [ ] Mengimplementasikan logika untuk menampilkan data dengan status berbeda (pending, active, rejected).
*   [ ] Menambahkan fitur untuk mengelola rilisan dan lagu (edit, tambah, hapus).
*   [ ] Memastikan Supabase Client di dashboard menggunakan RLS per-pengguna dengan benar untuk keamanan data.
