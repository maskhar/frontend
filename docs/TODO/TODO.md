# Project TODO List

Dokumen ini merangkum status implementasi fitur-fitur utama aplikasi.

## ✅ **Selesai (Completed)**

### **Halaman Publik:**

*   **Halaman Utama (`/`)**: Didasumsikan dasar, fungsionalitas utama belum dibahas.
*   **Katalog Musik (`/katalog`):**
    *   [x] Fetch data dari API eksternal (Lovable).
    *   [x] Tampilan grid rilisan yang responsif (desktop & mobile).
    *   [x] Pemilihan rilisan untuk menampilkan detail.
    *   [x] Pemutar musik global (mini player di bawah, sheet di mobile).
    *   [x] Fungsionalitas Play/Pause, Next/Prev, Shuffle, Repeat, Volume, Progress Bar.
    *   [x] Keamanan audio (sembunyikan URL, nonaktifkan klik kanan).
    *   [x] Paginasi `Infinite Scroll` untuk memuat lebih banyak data.
    *   [x] Tampilan detail rilisan di kolom kiri (desktop) dengan konten *sticky*.
    *   [x] Perbaikan tata letak UI/UX secara keseluruhan (responsif, penempatan judul, dll).
    *   [x] Penanganan *error* dan status *loading*.

### **Autentikasi & Dashboard:**

*   **Login (`/login`)**: Fungsionalitas dasar untuk login.
*   **Dashboard (`/dashboard`)**: Rute dilindungi, menunggu implementasi konten.
*   **Dashboard Contract (`/dashboard/contract`)**: Rute dilindungi, menunggu implementasi konten.
*   **Dashboard Services (`/dashboard/services`)**: Rute dilindungi, menunggu implementasi konten.

## 🔜 **Dalam Proses (In Progress)**

### **Fase 2.2: Manajemen State Global untuk Pemutar Musik (React Context)**

*   [x] **`PlayerContext`:** Sudah dibuat dan terintegrasi.
*   [x] **Komponen `Player.tsx`:** Sudah terintegrasi dengan PlayerContext untuk semua kontrolnya.
*   [x] **Komponen `NowPlayingSheet.tsx`:** Sudah terintegrasi dengan PlayerContext dan App.tsx/KatalogPage.tsx.

## 3. Belum Dimulai (Pending)

### Halaman Publik:

*   **Halaman Utama (`/`)**: Implementasi konten belum dibahas.
*   **Store Partner (`/store-partner`)**: Belum diimplementasikan.
*   **Services (`/services`)**: Belum diimplementasikan.
*   **Contract (`/contract`)**: Belum diimplementasikan.
*   **Kolaborasi (`/kolaborasi`)**: Belum diimplementasikan.
*   **Blog (`/blog`)**: Belum diimplementasikan.

### Fitur Lanjutan Katalog:

*   [x] **Tampilkan Badge "Explicit":** Menampilkan penanda visual untuk rilisan yang eksplisit (di level album/rilis).
*   [x] **Tampilkan Informasi Genre:** Menampilkan genre untuk setiap rilisan di halaman katalog.
*   [x] **Pencarian & Filter:** Fungsionalitas pencarian berdasarkan judul/artis telah diimplementasikan.
*   [ ] **URL Slug:** Mengganti ID di URL (`/katalog/:releaseId`) dengan nama rilisan yang lebih ramah SEO.

## Fase 3: Manajemen Musik di Dashboard (Fitur Baru)

*   [ ] Merancang dan membuat komponen UI baru untuk halaman manajemen musik di dashboard.
*   [ ] Memastikan Supabase Client di dashboard menggunakan RLS per-pengguna dengan benar.
*   [ ] Menampilkan data di UI dashboard dengan opsi manajemen (edit, approve, reject).
