# Rencana Pengembangan Halaman Katalog

Dokumen ini melacak tugas yang perlu diselesaikan untuk mengimplementasikan dan memperbaiki halaman katalog musik.

## Fase 1: Perbaikan Aliran Data & Fungsionalitas Dasar (WIP)

Tujuan dari fase ini adalah untuk mengatasi masalah halaman blank, memastikan data dari database Supabase B dapat diambil dengan benar, dan ditampilkan di frontend.

- [x] Mendiagnosis masalah halaman blank (ditemukan `supabase.functions.getUrl is not a function`).
- [x] Memperbarui library `@supabase/supabase-js` ke versi terbaru.
- [x] Mengatasi masalah *cache* Vite dengan membangun URL fungsi secara manual.
- [x] Mendiagnosis error dari *Edge Function* (`Supabase B credentials not set`).
- [x] Mengidentifikasi masalah penamaan *secrets* (`SUPABASE_` prefix is reserved).
- [ ] **[In Progress]** Mendefinisikan "Kontrak Data" yang akurat berdasarkan skema tabel `tracks` dan `releases`.
- [ ] Memperbarui *Edge Function* `get-catalog-tracks` dengan query Supabase yang benar sesuai kontrak data.
- [ ] Mengatur *secrets* di Supabase (Proyek A) dengan nama yang benar (`PROJECT_B_URL`, `PROJECT_B_ANON_KEY`) untuk koneksi ke Proyek B.
- [ ] Memastikan data berhasil ditampilkan di halaman katalog dalam bentuk daftar lagu sederhana.

## Fase 2: Peningkatan UI/UX & Logika Tampilan

Setelah data mengalir dengan benar, fase ini berfokus pada peningkatan pengalaman pengguna agar sesuai dengan logika bisnis.

- [ ] Mengelompokkan lagu berdasarkan rilis (`releases`) di halaman katalog.
- [ ] Membuat logika tampilan yang berbeda untuk tipe rilis `Single`, `EP`, dan `Album`.
- [ ] Menampilkan *badge* "Explicit" jika lagu memiliki penanda `explicit_lyrics`.
- [ ] Menampilkan informasi `genre` untuk setiap lagu.
- [ ] Mengimplementasikan fungsionalitas pencarian dan filter di halaman katalog.
- [ ] Menyesuaikan komponen pemutar media (media player) untuk menangani antrean putar (playlist) untuk Album/EP.
