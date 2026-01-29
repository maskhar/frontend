# Checklist Pengujian Final: Fitur Harga & Paket Dinamis

**Tanggal:** 29 Januari 2026

Dokumen ini berisi langkah-langkah untuk menguji keseluruhan alur fitur manajemen harga, dari dasbor hingga tampilan di frontend.

---

### ✅ Checklist Pengujian

1.  **[ ] Verifikasi Halaman Manajemen Terpusat:**
    - [x] Buka *browser* dan navigasi ke `/dashboard/pricing-management`.
    - [ ] Pastikan halaman tampil dengan benar dan memiliki dua tab: "Manajemen Kategori" dan "Manajemen Paket".

2.  **[ ] Kelola Kategori:**
    - [ ] Di tab "Manajemen Kategori", klik **"Tambah Baru"**.
    - [ ] Buat minimal 2 kategori baru. Isi semua kolom, terutama **Nama**, **Slug** (contoh: `distribusi-digital`), dan **Deskripsi Panjang**.
    - [ ] Pastikan kategori baru muncul di tabel.
    - [ ] Coba **Edit** salah satu kategori yang sudah dibuat.
    - [ ] Coba **Hapus** salah satu kategori (pastikan paket di dalamnya tidak ada, atau akan terhapus juga jika ada relasi *cascade*).

3.  **[ ] Kelola Paket:**
    - [ ] Pindah ke tab "Manajemen Paket", klik **"Tambah Baru"**.
    - [ ] Buat minimal 3-4 paket baru.
    - [ ] Pastikan Anda dapat memilih **Kategori** yang sesuai untuk setiap paket dari menu *dropdown*.
    - [ ] Isi semua detailnya (harga, deskripsi singkat, deskripsi panjang dalam format JSON, dll.).
    - [ ] Pastikan paket-paket baru muncul di tabel.
    - [ ] Coba **Edit** dan **Hapus** salah satu paket.

4.  **[ ] Verifikasi `Navbar` (Dropdown "Harga") Dinamis:**
    - [ ] Buka halaman utama situs Anda (misalnya, `/`) di tab/jendela browser lain.
    - [ ] Lakukan **Hard Refresh** (`Ctrl + Shift + R`).
    - [ ] Arahkan kursor ke menu **"Harga"** di *navbar*.
    - [ ] Pastikan *dropdown* muncul dan **menampilkan nama-nama Kategori** yang Anda buat di dasbor.
    - [ ] Klik salah satu Kategori di *dropdown*.
    - [ ] Pastikan Anda diarahkan ke halaman detail yang benar (contoh: `/pricing/distribusi-digital`).

5.  **[ ] Verifikasi Halaman `/pricing` (Halaman Ringkasan):**
    - [ ] Buka halaman `/pricing` secara langsung.
    - [ ] Pastikan semua Kategori dan Paket yang Anda buat di dasbor muncul dengan benar, dikelompokkan sesuai kategorinya.

6.  **[ ] Verifikasi Halaman Detail Kategori (`/pricing/:slug`):**
    - [ ] Dari halaman `/pricing`, klik salah satu **judul Kategori**.
    - [ ] Pastikan Anda diarahkan ke halaman detail yang benar.
    - [ ] Pastikan halaman ini **HANYA menampilkan paket-paket** yang termasuk dalam kategori tersebut.
    - [ ] Pastikan **Deskripsi Panjang** untuk kategori itu juga muncul di bagian bawah halaman.

---

Jika semua langkah di atas berjalan lancar, maka implementasi fitur ini dianggap berhasil.
