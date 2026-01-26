# Dokumentasi Implementasi Halaman Katalog

**Tanggal:** 27 Januari 2026
**Status:** Dalam Pengembangan (Fase 1)

## 1. Latar Belakang & Tujuan

Dokumen ini merangkum arsitektur dan detail implementasi teknis untuk halaman **Katalog Musik**. Tujuan utama adalah membangun halaman yang aman, performan, dan mudah dipelihara untuk menampilkan katalog musik yang datanya bersumber dari database Supabase eksternal (selanjutnya disebut **Proyek B**).

Proyek ini mengatasi masalah awal di mana halaman katalog menampilkan layar putih (*whitescreen*) dan bertujuan untuk mengimplementasikan fungsionalitas penuh, termasuk tampilan logis untuk rilisan Single, EP, dan Album.

## 2. Arsitektur Sistem

Untuk memastikan keamanan dan pemisahan tanggung jawab, sistem ini dirancang dengan arsitektur perantara (intermediary).

**Alur Data:**
`Frontend (React)` ➡️ `Edge Function (di Proyek A)` ➡️ `Database (di Proyek B)`

- **Frontend (Aplikasi React):** Bertanggung jawab murni untuk tampilan (UI) dan pengalaman pengguna (UX). Frontend **tidak pernah** memiliki akses langsung ke database Proyek B.
- **Edge Function (`get-catalog-tracks`):** Berperan sebagai **Penjaga Gerbang (Gatekeeper)** yang aman. Fungsi ini di-*deploy* di Supabase **Proyek A** (proyek yang sama dengan frontend). Tugasnya adalah menerima permintaan dari frontend, mengambil data yang diperlukan dari Proyek B dengan aman, memformatnya sesuai kontrak, dan mengirimkannya kembali ke frontend.
- **Database (Proyek B):** Merupakan sumber data utama yang berisi tabel `tracks` dan `releases`. Akses ke database ini dari Edge Function menggunakan kunci API `anon` yang bersifat **Read-Only (hanya bisa membaca)**, sehingga mencegah segala kemungkinan modifikasi atau penghapusan data dari luar.

## 3. Kontrak Data (Data Contract)

"Kontrak Data" adalah perjanjian antara frontend dan backend mengenai struktur data yang akan dipertukarkan. Ini memastikan kedua tim bisa bekerja secara independen dan mengurangi risiko *error*.

Berdasarkan analisis skema database, data yang dikirim dari *Edge Function* ke *frontend* untuk setiap lagu akan memiliki struktur sebagai berikut:

```json
{
  "id": "uuid", // ID dari tabel tracks
  "title": "string", // Judul dari tabel tracks
  "audioSrc": "string", // URL audio dari kolom audio_url di tabel tracks
  "isExplicit": "boolean", // Status dari explicit_lyrics di tabel tracks
  "genre": "string", // Genre dari tabel tracks
  "release": {
    "title": "string", // Judul dari tabel releases
    "artistName": "string", // Nama artis dari kolom artist_name di tabel releases
    "albumArt": "string", // URL cover dari kolom cover_art di tabel releases
    "type": "string" // Tipe rilisan (e.g., 'Single', 'EP', 'Album')
  }
}
```

## 4. Implementasi Teknis

### Backend (Edge Function)
- **Lokasi Kode:** `supabase/functions/get-catalog-tracks/index.ts`
- **Tugas:**
    1. Menggunakan **Supabase Secrets** (`PROJECT_B_URL`, `PROJECT_B_ANON_KEY`) untuk menyimpan kredensial Proyek B secara aman. Penggunaan nama tanpa prefix `SUPABASE_` wajib untuk menghindari konflik dengan variabel sistem.
    2. Menjalankan *query* spesifik ke database Proyek B untuk menggabungkan data dari tabel `tracks` dan `releases` menggunakan relasi *foreign key* (`releases_id`).
    3. **Hanya memilih kolom yang diperlukan** sesuai "Kontrak Data" untuk meningkatkan performa dan keamanan.
    4. Memformat data hasil *query* ke dalam struktur JSON yang telah disepakati.
    5. Menyertakan **CORS Headers** agar dapat diakses oleh domain frontend.

### Frontend (React Component)
- **Lokasi Kode:** `src/pages/Katalog.tsx`
- **Tugas:**
    1. Memanggil *endpoint* Edge Function saat komponen dimuat. URL fungsi dibangun secara manual (`<supabase_url>/functions/v1/get-catalog-tracks`) untuk menghindari masalah dependensi pada library client.
    2. Menangani tiga state utama: *loading* (saat data diambil), *error* (jika pengambilan gagal), dan *success* (saat data berhasil diterima).
    3. **(Fase 2)** Mengimplementasikan logika untuk mengelompokkan daftar lagu yang diterima berdasarkan rilisannya (`release.title`).
    4. **(Fase 2)** Menampilkan komponen secara dinamis berdasarkan tipe rilis (Single vs Album/EP) dan menampilkan *badge* untuk `isExplicit`.

## 5. Keamanan
- **Akses Terbatas:** Kunci API yang digunakan untuk Proyek B adalah `anon key` yang tidak memiliki izin untuk menulis, mengubah, atau menghapus data.
- **Isolasi Logika:** Logika bisnis dan *query* database sepenuhnya terisolasi di dalam *Edge Function*. Frontend tidak memiliki pengetahuan tentang struktur database, sehingga mengurangi permukaan serangan.
- **Manajemen Kredensial:** Kredensial sensitif dikelola menggunakan Supabase Secrets yang terenkripsi, bukan di-hardcode di dalam kode.
