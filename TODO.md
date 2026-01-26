# Rencana Pengembangan Halaman Katalog & Manajemen Musik

Dokumen ini melacak tugas yang perlu diselesaikan untuk mengimplementasikan, memperbaiki, dan memperluas fungsionalitas terkait katalog musik.

## Fase 1: Perbaikan Aliran Data & Fungsionalitas Dasar Katalog Publik (SELESAI)

Tujuan dari fase ini adalah untuk mengatasi masalah halaman blank, memastikan data dari database Supabase B dapat diambil dengan benar melalui endpoint yang telah disediakan, dan ditampilkan di frontend.

- [x] Mendiagnosis masalah awal (halaman blank, error `getUrl`, dll.).
- [x] Mencoba pendekatan RLS publik dan menemukan bahwa itu merusak keamanan data di dashboard.
- [x] **[Kunci Pembelajaran]** Mengidentifikasi bahwa platform hosting (Lovable) telah menyediakan Edge Function `get-catalog-tracks` yang aman di Proyek B.
- [x] Mengadopsi arsitektur yang benar: Frontend (Proyek A) memanggil Edge Function yang sudah ada (di Proyek B) secara langsung.
- [x] Menghapus kebijakan RLS publik yang salah dari Proyek B.
- [x] Memperbarui komponen `Katalog.tsx` untuk menggunakan `fetch` ke endpoint Proyek B dengan `apikey` yang benar.
- [x] Memastikan data berhasil ditampilkan di halaman katalog (`/katalog`).

## Fase 2: Peningkatan UI/UX Katalog Publik (Berikutnya)

Setelah data mengalir dengan benar, fase ini berfokus pada peningkatan pengalaman pengguna agar halaman katalog (`/katalog`) lebih interaktif dan sesuai dengan logika bisnis.

- [ ] Mengelompokkan lagu berdasarkan rilis (`releases`) di halaman katalog.
- [ ] Membuat logika tampilan yang berbeda untuk tipe rilis `Single`, `EP`, dan `Album`.
- [ ] Menampilkan *badge* "Explicit" jika lagu memiliki penanda `explicit_lyrics`.
- [ ] Menampilkan informasi `genre` untuk setiap lagu.
- [ ] Mengimplementasikan fungsionalitas pencarian dan filter di halaman katalog.
- [ ] Menyesuaikan komponen pemutar media (media player) untuk menangani antrean putar (playlist) untuk Album/EP.

## Fase 3: Membangun UI Manajemen Musik di Dashboard (Fitur Baru)

Fase ini bertujuan untuk mengimplementasikan halaman di dalam dashboard admin untuk mengelola musik, yang memiliki kebutuhan data dan keamanan yang berbeda dari katalog publik.

- [ ] Merancang dan membuat komponen UI baru untuk halaman manajemen musik di dashboard.
- [ ] Memastikan Supabase Client di dashboard menggunakan RLS per-pengguna dengan benar.
- [ ] Menampilkan data di UI dashboard, kemungkinan dalam bentuk tabel dengan informasi status dan opsi manajemen (edit, approve, reject).
