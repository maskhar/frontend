# Dokumentasi Arsitektur Halaman Katalog Eksternal

**Tanggal:** 27 Januari 2026
**Status:** Fase 2 Selesai - Fungsional, Responsif, dan Kaya Fitur

## 1. Latar Belakang & Tujuan

Dokumen ini merangkum arsitektur dan detail implementasi teknis untuk halaman **Katalog Musik** publik. Halaman ini dibangun di dalam proyek Frontend (**Proyek A**) namun bertujuan untuk menampilkan data musik secara aman dari database Supabase yang terpisah (milik platform SoundPub Dashboard, **Proyek B**).

## 2. Arsitektur Sistem & Alur Data

Sistem ini dirancang dengan arsitektur perantara (*intermediary*) untuk memastikan keamanan dan pemisahan tanggung jawab.

**Alur Data:**
`Frontend (React)` ➡️ `GET Request` ➡️ `Edge Function "get-catalog-tracks" (di Proyek B)` ➡️ `Database (Proyek B)`

- **Frontend (Aplikasi React):** Bertanggung jawab untuk UI/UX. Tidak pernah memiliki akses langsung ke database Proyek B.
- **Edge Function (`get-catalog-tracks`):** Berperan sebagai **Penjaga Gerbang (Gatekeeper)** yang aman, di-*host* di Proyek B. Fungsi ini menggunakan `service_role_key` internal untuk melewati RLS, memfilter data `releases` dengan `status = 'active'`, dan mengirimkannya kembali.
- **Database (Proyek B):** Sumber data utama. Akses untuk pengguna yang login di dashboard tetap dilindungi oleh Row Level Security (RLS) yang ketat.

## 3. Desain UI/UX & Fungsionalitas

### 3.1. Tata Letak Responsif
Halaman katalog menggunakan pendekatan desain responsif yang beradaptasi dengan ukuran layar:
- **Desktop (`md` ke atas):** Menampilkan tata letak dua kolom:
    - **Kolom Kiri (1/3 lebar):** Menampilkan judul halaman, detail rilisan yang dipilih (*cover art*, judul, daftar lagu). Kolom ini bersifat **sticky** dan tetap terlihat saat pengguna men-*scroll* perpustakaan.
    - **Kolom Kanan (2/3 lebar):** Menampilkan **grid perpustakaan** dari semua rilisan yang tersedia. Grid ini juga responsif, menampilkan 3 hingga 8 item per baris tergantung lebar layar.
- **Mobile (`< md`):**
    - **Kolom Kiri disembunyikan** untuk memaksimalkan ruang.
    - **Kolom Kanan (grid perpustakaan)** menjadi tampilan utama, mengambil lebar penuh layar. Judul halaman ditampilkan di atas *grid*.

### 3.2. Pemutar Musik Global (`PlayerContext`)
Untuk mengelola status pemutaran di seluruh aplikasi, kami mengimplementasikan **React Context (`PlayerContext`)**.
- **State Terpusat:** Mengelola `playlist`, `nowPlaying`, `isPlaying`, `volume`, `progress`, `isShuffle`, dan `repeatMode`.
- **Akses Global:** `PlayerProvider` membungkus seluruh aplikasi di `App.tsx`, memungkinkan komponen mana pun untuk mengakses dan mengontrol pemutar.

### 3.3. Komponen Pemutar (`Player.tsx` & `NowPlayingSheet.tsx`)
- **Pemutar Bawah:** Komponen `<Player />` selalu terlihat di bagian bawah layar setelah musik dimulai.
    - **Desktop:** Menampilkan tata letak tiga kolom (info lagu, kontrol utama, volume).
    - **Mobile:** Menampilkan "mini player" yang ringkas (cover, info, tombol play/pause). Mengetuk area info akan memicu `NowPlayingSheet`.
- **Sheet "Now Playing":** Di *mobile*, komponen `<NowPlayingSheet />` meluncur dari bawah, menampilkan *cover art* besar, kontrol pemutar lengkap, dan daftar putar "Up Next".

### 3.4. Paginasi & Infinite Scroll
Untuk menangani katalog yang besar dan batasan 100 item per permintaan dari API, *frontend* mengimplementasikan **infinite scroll**:
- **Intersection Observer API:** Digunakan untuk mendeteksi kapan pengguna men-*scroll* hingga elemen terakhir di *grid* perpustakaan.
- **Pengambilan Data Bertahap:** Saat elemen terakhir terlihat, *frontend* secara otomatis membuat permintaan API baru dengan `offset` yang diperbarui untuk mengambil "halaman" data berikutnya.
- **Penambahan Data:** Data baru ditambahkan ke daftar yang sudah ada, menciptakan pengalaman men-*scroll* yang mulus dan tak terbatas bagi pengguna. Judul perpustakaan juga diperbarui secara dinamis untuk menampilkan jumlah total rilisan.

## 4. Keamanan
- **Akses Terbatas:** Kunci API yang digunakan oleh *frontend* adalah `anon key` yang tidak memiliki izin tulis.
- **Isolasi Logika:** Logika bisnis dan *query* database terisolasi di dalam *Edge Function*.
- **Keamanan Audio:** URL audio asli disembunyikan dari pengguna biasa dengan mengambilnya sebagai `Blob` dan membuat `blob:url` sementara. Klik kanan juga dinonaktifkan untuk mencegah "Save Audio As...".
- **Pemisahan Alur:** Alur data untuk katalog publik (via *Edge Function*) sepenuhnya terpisah dari alur data untuk pengguna yang sudah login di *dashboard* (yang menggunakan RLS).
