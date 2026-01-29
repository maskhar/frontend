# Arsitektur Alur Pendaftaran & Kontrak (/pricing)

**Tanggal:** 28 Januari 2026
**Status:** Terimplementasi

## 1. Ringkasan Eksekutif

Dokumen ini menguraikan arsitektur dan strategi implementasi untuk alur pendaftaran pengguna baru, mulai dari pemilihan paket harga hingga aktivasi akun di dasbor utama. Fitur ini merupakan gerbang utama bagi pengguna untuk masuk ke ekosistem layanan dan akan melibatkan dua sistem yang terpisah: Proyek A (Frontend) dan Proyek B (Backend/Sistem Dashboard).

## 2. Alur Pengguna (User Journey)

Alur pengguna dirancang dengan pendekatan hybrid (ringkasan dan detail) untuk memberikan informasi yang komprehensif.

1.  **Halaman Pricelist (`/pricing`):** Pengguna mengunjungi halaman utama harga yang menampilkan **semua paket** dalam bentuk kartu-kartu untuk perbandingan.
2.  **Melihat Detail:** Di setiap kartu paket, terdapat tombol/tautan **"Lihat Detail"**.
3.  **Halaman Detail Paket (`/pricing/:slug`):** Setelah mengklik "Lihat Detail", pengguna diarahkan ke halaman dinamis yang menampilkan informasi lengkap, deskripsi panjang, dan semua fitur dari satu paket spesifik tersebut.
4.  **Pemilihan Paket:** Di halaman detail (atau bisa juga di halaman ringkasan), pengguna menekan tombol "Pilih Paket" atau "Daftar".
5.  **Pendaftaran:** Pengguna diarahkan ke form pendaftaran untuk membuat akun baru.
6.  **Dashboard Sementara:** Setelah berhasil mendaftar, pengguna masuk ke versi terbatas dari dasbor.
7.  **Form Kontrak Digital:** Pengguna mengisi dan menyetujui kontrak secara digital.
8.  **Pembayaran:** Pengguna diarahkan ke gerbang pembayaran.
9.  **Dashboard Utama:** Setelah pembayaran berhasil, akun pengguna diaktifkan sepenuhnya.

## 3. Desain Arsitektur Teknis

Arsitektur ini didasarkan pada pemisahan sistem dan komunikasi melalui API Gateway untuk keamanan dan skalabilitas.

### 3.1. Komponen Sistem

*   **Proyek A (Aplikasi Frontend):**
    *   **Peran:** Bertindak sebagai "etalase" dan gerbang masuk.
    *   **Tanggung Jawab:** Menampilkan halaman `/pricing`, menangani UI pendaftaran, dan mengarahkan pengguna. Aplikasi ini bersifat *client-side* dan tidak memiliki akses langsung ke logika bisnis atau database Proyek B.

*   **Proyek B (Sistem Backend/Dashboard):**
    *   **Peran:** Bertindak sebagai "otak" dan sumber kebenaran (source of truth).
    *   **Tanggung Jawab:** Mengelola data pengguna, status kontrak, status pembayaran, dan menyediakan fungsionalitas dasbor utama. Menggunakan database sendiri (Database B) dengan skema dan RLS yang ketat.

### 3.2. Strategi API Gateway

Komunikasi antara Proyek A dan B akan dimediasi oleh API Gateway. Ini memastikan Proyek A tidak perlu mengetahui detail implementasi Proyek B.

*   **Implementasi:** API Gateway dapat diimplementasikan sebagai serangkaian *Edge Functions* di salah satu proyek Supabase (disarankan di Proyek B untuk lebih dekat dengan data).
*   **Contoh Endpoints di API Gateway:**
    *   `POST /api/users/register`: Diterima dari form pendaftaran di Proyek A. Gateway ini kemudian akan memanggil fungsi Supabase Auth di Proyek B untuk membuat pengguna dan sekaligus membuat entri data terkait di tabel `profiles` atau `accounts`.
    *   `POST /api/contracts`: Diterima saat pengguna menyetujui form kontrak digital. Gateway akan menyimpan data kontrak yang sudah disetujui dan mengasosiasikannya dengan `user_id`.
    *   `GET /api/users/{userId}/status`: Mungkin dipanggil oleh Proyek A untuk memeriksa status pengguna saat ini (misalnya, untuk menentukan apakah harus menampilkan dasbor sementara atau utama).
    *   `POST /api/webhooks/payment-gateway`: Endpoint yang menerima notifikasi dari pihak ketiga (gerbang pembayaran) untuk mengonfirmasi pembayaran dan mengaktifkan akun pengguna.

### 3.3. Strategi Sinkronisasi Data

Sinkronisasi data akan bersifat *event-driven* dan satu arah untuk alur ini, dari Proyek A ke Proyek B melalui API Gateway.

*   **Pendaftaran:** Saat pengguna mendaftar, tidak ada sinkronisasi dua arah. API Gateway memastikan data pengguna langsung dibuat di tempat yang benar (Proyek B).
*   **Status Akun:** Proyek A tidak menyimpan status akun. Setiap kali dibutuhkan, Proyek A akan bertanya kepada API Gateway (`GET /api/users/{userId}/status`) untuk mendapatkan status terbaru, memastikan data yang ditampilkan selalu akurat.
*   **Pembaruan via Webhook:** Perubahan status paling krusial (aktivasi akun) sepenuhnya ditangani di *backend* melalui *webhook*, memastikan keamanan dan keandalan proses.

## 4. Pertimbangan Keamanan

*   **RLS (Row Level Security):** Akan diimplementasikan secara ketat di Database B. Bahkan jika API Gateway ditembus, RLS akan mencegah satu pengguna mengakses data pengguna lain.
*   **CRUD via Functions:** Semua operasi CUD (Create, Update, Delete) pada data sensitif hanya boleh dilakukan melalui *trusted* Supabase Functions (dengan `service_role_key`), yang dipanggil oleh API Gateway, bukan langsung dari klien.
*   **Manajemen Kunci API:** Proyek A hanya akan memiliki `anon_key` untuk API Gateway, yang memiliki hak akses sangat terbatas.
