# Dokumentasi Arsitektur Halaman Katalog Eksternal

**Tanggal:** 27 Januari 2026
**Status:** Fase 1 Selesai - Fungsional

## 1. Latar Belakang & Tujuan

Dokumen ini merangkum arsitektur final dan detail implementasi teknis untuk halaman **Katalog Musik** publik. Halaman ini dibangun di dalam proyek Frontend (selanjutnya disebut **Proyek A**) namun bertujuan untuk menampilkan data musik secara aman dari database Supabase yang terpisah (milik platform SoundPub Dashboard, selanjutnya disebut **Proyek B**).

Proyek ini mengatasi masalah awal di mana halaman katalog menampilkan layar putih (*whitescreen*) dan berbagai error lainnya, yang berpuncak pada penemuan dan implementasi arsitektur interaksi antar-proyek yang aman dan efisien.

## 2. Ringkasan Masalah & Proses Investigasi

Perjalanan untuk mencapai solusi ini mengungkap beberapa akar masalah yang berbeda:

1.  **Error Frontend:** Masalah awal adalah error di sisi klien seperti `supabase.functions.getUrl is not a function` dan masalah *cache* Vite, yang mengindikasikan adanya ketidakcocokan antara versi library dan cara fungsi dipanggil.
2.  **Error Koneksi & Nama Kolom:** Setelah masalah frontend teratasi, kami mengalami serangkaian *error* dari *backend* (misalnya `column does not exist`). Ini terjadi karena ketidakcocokan antara "Kontrak Data" yang diasumsikan di kode dengan skema database yang sebenarnya.
3.  **RLS & Keamanan Data:** Upaya awal untuk membuka akses data publik dengan menambahkan kebijakan RLS (`CREATE POLICY ... USING (status = 'active')`) berhasil menampilkan data, **namun menimbulkan masalah keamanan yang kritis**: kebijakan tersebut bersifat aditif (`OR`) dan secara tidak sengaja memberikan akses kepada semua pengguna yang sudah login (artis, label) untuk melihat data rilisan aktif milik pengguna lain, melanggar privasi data.
4.  **Akar Masalah Sebenarnya Terungkap:** Akar masalah utama bukanlah pada kegagalan kode, melainkan **kesalahpahaman arsitektur**. Platform hosting (Lovable/Proyek B) ternyata **sudah menyediakan *endpoint* Edge Function `get-catalog-tracks` yang aman dan siap pakai**. Upaya kami untuk membuat Edge Function duplikat di Proyek A menjadi tidak perlu dan rumit.

## 3. Arsitektur Final: Dua "Jalan Tol" yang Aman & Terpisah

Arsitektur final yang diimplementasikan adalah praktik terbaik untuk skenario ini, memisahkan akses data untuk pengguna publik dan pengguna terautentikasi.

### Alur 1: Jalan Tol Publik (Frontend Proyek A → Backend Proyek B)

Ini adalah alur untuk halaman `/katalog` publik.

`Frontend (React, Proyek A)` ➡️ `GET Request` ➡️ `Edge Function "get-catalog-tracks" (di Proyek B)` ➡️ `Database (Proyek B)`

1.  **Frontend (`Katalog.tsx`):**
    *   Menggunakan `fetch` standar untuk memanggil *endpoint* URL yang sudah ditentukan secara langsung: `https://[project-b-ref].supabase.co/functions/v1/get-catalog-tracks`.
    *   Menyertakan `apikey` (kunci `anon` publik) dari **Proyek B** di dalam *header* `Authorization` dan `apikey` untuk otentikasi.

2.  **Edge Function (di Proyek B, Disediakan oleh Platform):**
    *   Bertindak sebagai **Penjaga Gerbang (Gatekeeper)**.
    *   Menggunakan `service_role_key` internal yang aman untuk **melewati (bypass) RLS** di dalam lingkungannya sendiri.
    *   Memiliki logika bisnis yang terkunci: hanya mengambil rilisan dengan `status = 'active'`, memilih kolom-kolom tertentu yang aman untuk publik, dan menggabungkannya dengan data lagu.
    *   Mengembalikan data dalam format JSON yang bersih dan siap pakai.

**Keamanan Alur Ini:** Sangat aman. *Frontend* tidak pernah memiliki akses ke database. `service_role_key` tidak pernah terekspos ke publik. Logika bisnis terpusat dan terkontrol di *backend*.

### Alur 2: Jalan Tol Pribadi (Dashboard SoundPub - Proyek B)

Ini adalah alur untuk pengguna yang sudah login di dalam *dashboard*.

`Dashboard (React, Proyek B)` ➡️ `Supabase Client (JS)` ➡️ `RLS Policies (di Database B)` ➡️ `Database (Proyek B)`

1.  **Dashboard (Proyek B):**
    *   Menggunakan Supabase Client standar yang diinisialisasi dengan kredensial Proyek B.
    *   Saat pengguna login, Supabase Client secara otomatis mengelola JWT (kartu identitas pengguna).

2.  **RLS Policies (di Database B):**
    *   Setiap kali Supabase Client melakukan *query* (`select`, `insert`, `update`), "satpam" RLS di database akan memeriksa JWT pengguna.
    *   RLS menerapkan aturan seperti `USING (artist_name = get_user_full_name(auth.uid()))`, memastikan pengguna hanya bisa melihat atau mengubah data mereka sendiri.

**Keamanan Alur Ini:** Sangat aman. Setiap permintaan data divalidasi di level database berdasarkan identitas pengguna yang login.

## 4. Kesimpulan

Dengan memisahkan kedua alur ini, kita berhasil mencapai dua tujuan utama secara bersamaan:
1.  **Menyediakan data katalog publik** untuk situs eksternal (Proyek A) secara efisien dan aman.
2.  **Menjaga keamanan dan privasi data** multi-pengguna di dalam aplikasi Dashboard SoundPub (Proyek B) dengan RLS yang ketat.

Arsitektur ini adalah solusi yang tangguh dan skalabel untuk mengelola interaksi antara layanan publik dan platform internal yang aman.