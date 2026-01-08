# Panduan Instalasi Cepat

## Langkah-langkah Instalasi

### 1. Pastikan MongoDB Berjalan
```bash
# Cek status MongoDB
mongosh

# Jika belum berjalan, start MongoDB
net start MongoDB
```

### 2. Install Dependencies Backend
```bash
cd backend
npm install
```

**Catatan**: Proses ini akan menginstall semua dependencies yang dibutuhkan oleh NestJS backend, termasuk MongoDB driver, JWT, bcrypt, dan parquet.js.

### 3. Install Dependencies Frontend
```bash
cd frontend
npm install
```

**Catatan**: Proses ini akan menginstall Next.js, React, Tailwind CSS, dan dependencies lainnya.

### 4. Jalankan Backend (Terminal 1)
```bash
cd backend
npm run start:dev
```

**Output yang diharapkan**:
```
Application is running on: http://localhost:3001
Super admin created successfully (jika baru pertama kali)
```

### 5. Jalankan Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

**Output yang diharapkan**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 6. Akses Aplikasi

Buka browser: `http://localhost:3000`

**Login dengan**:
- Username: `superadmin`
- Password: `admin123`

## Selesai!

Aplikasi sudah siap digunakan. Anda dapat:

1. **Membuat User Baru** (sebagai Superadmin):
   - Buka menu "Kelola User"
   - Klik "Tambah User"
   - Isi data dan pilih role (admin/superadmin)

2. **Mengelola Struktur Anggaran**:
   - Buka menu "Struktur Anggaran"
   - Klik "Tambah Data"
   - Pilih tahun anggaran
   - Pilih satker dari list (data otomatis dimuat dari API parquet)
   - Isi nilai belanja
   - Simpan

3. **Melihat Dashboard**:
   - Statistik otomatis terupdate sesuai data yang diinput
   - Filter berdasarkan tahun

4. **Melihat Log Aktivitas**:
   - Semua aktivitas tercatat otomatis
   - Dapat melihat siapa yang melakukan apa dan kapan

## Troubleshooting Cepat

**MongoDB tidak terkoneksi**:
```bash
# Restart MongoDB
net stop MongoDB
net start MongoDB
```

**Port 3000/3001 sudah dipakai**:
```bash
# Frontend - ganti port
npm run dev -- -p 3002

# Backend - edit file .env
PORT=3002
```

**Lupa password superadmin**:
Hapus database dan restart backend untuk reset:
```bash
mongosh
use struktur-anggaran
db.dropDatabase()
exit
```

Kemudian restart backend, superadmin akan dibuat ulang dengan password default.
