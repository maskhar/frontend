module.exports = {
  apps: [
    {
      name: 'dev-frontend',      // Nama aplikasi di PM2
      script: 'npm',
      args: 'run dev',                 // Menjalankan perintah 'run dev'
      env: {
        NODE_ENV: 'development',
        PORT: 8082                     // Sesuaikan port jika perlu
      },
      watch: false,                     // Restart otomatis jika ada perubahan file (cocok untuk dev)
      ignore_watch: [                  // Folder yang diabaikan saat perubahan file
        "node_modules",
        ".git",
        "public",
        ".next"                        // Jika pakai Next.js, abaikan folder buildnya
      ],
      max_memory_restart: '1G',        // Restart jika penggunaan RAM lebih dari 1GB
      error_file: './logs/err.log',    // Lokasi log error
      out_file: './logs/out.log',      // Lokasi log output
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
  ],
};

// TODO: Sesuaikan konfigurasi di atas sesuai kebutuhan proyek Anda.
