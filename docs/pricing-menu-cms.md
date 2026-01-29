# Arsitektur: Manajemen Item Dropdown Harga

**Tanggal:** 28 Januari 2026
**Status:** Digabungkan ke Arsitektur Utama

**Catatan:** Konsep dalam dokumen ini telah disederhanakan dan digabungkan ke dalam `pricing-flow-architecture.md`.

## 1. Ringkasan

Dokumen ini menguraikan arsitektur untuk fitur manajemen dinamis yang memungkinkan admin mengelola item-item menu di dalam **dropdown "Harga"** pada `Navbar`. Fitur ini akan menggantikan daftar tautan yang di-*hardcode* dengan data yang diambil dari database, memberikan fleksibilitas untuk mengubahnya melalui dasbor.

## 2. Desain Database

Sebuah tabel baru, `pricing_menu_links`, akan dibuat untuk menyimpan item-item menu ini.

### Skema Tabel: `public.pricing_menu_links`

| Nama Kolom      | Tipe Data                  | Keterangan                                                               |
|-----------------|----------------------------|--------------------------------------------------------------------------|
| `id`            | `uuid` (Primary Key)       | Identifier unik untuk setiap item.                                       |
| `created_at`    | `timestamp with time zone` | Waktu pembuatan record.                                                  |
| `name`          | `text`                     | Teks yang ditampilkan (misalnya: "Paket Dasar").                        |
| `path`          | `text`                     | URL tujuan (misalnya: "/pricing#basic").                               |
| `description`   | `text` (nullable)          | Deskripsi singkat yang muncul di bawah nama.                             |
| `display_order` | `integer`                  | Menentukan urutan item menu di dalam dropdown.                           |
| `status`        | `item_status` (enum)       | Status item menu ('active' atau 'inactive').                           |

- **RLS:** Kebijakan *read* bersifat publik untuk item yang `active`, sementara CUD dibatasi untuk admin di dasbor.

## 3. Fungsionalitas Dasbor (`/dashboard/pricing-menu`)

Akan dibuat halaman CRUD baru yang terfokus untuk mengelola `pricing_menu_links`.

- **Tampilan Utama:** Sebuah tabel sederhana yang menampilkan semua item `pricing_menu_links` dengan kolom: `name`, `path`, `description`, `display_order`, `status`.
- **Operasi CRUD:**
  - **Tambah:** Tombol untuk membuka form/dialog guna menambah item baru.
  - **Edit:** Tombol di setiap baris untuk mengubah item yang ada.
  - **Hapus:** Tombol di setiap baris untuk menghapus item.
- **Pengurutan (Ordering):** Urutan akan dikelola dengan mengedit angka pada kolom `display_order`.

## 4. Perubahan di Komponen Frontend (`Navbar.tsx`)

Modifikasi akan dilokalisasi hanya pada komponen `NavigationMenu` untuk "Harga".

1.  **Pengambilan Data:** Komponen `Navbar` akan menggunakan `useEffect` untuk mengambil data dari tabel `pricing_menu_links`.
2.  **Render Dinamis:** Daftar tautan di sisi kanan *dropdown* "Harga" (yang saat ini di-*hardcode*) akan di-render secara dinamis dengan melakukan iterasi pada data yang telah diambil dari database. Tampilan visual *dropdown* akan tetap sama.
3.  **Struktur Statis:** Item menu utama lainnya ("Home", "Katalog", dll.) akan tetap di-*hardcode* seperti semula di dalam *array* `navLinks`.
