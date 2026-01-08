# Aplikasi Struktur Anggaran 2026

Aplikasi pengelolaan struktur anggaran berbasis web dengan Next.js (Frontend) dan NestJS (Backend).

## Fitur Utama

- **Autentikasi & Autorisasi**: Login dengan role Admin dan Superadmin
- **Dashboard**: Statistik dan visualisasi data struktur anggaran
- **Manajemen Struktur Anggaran**: CRUD data struktur anggaran dengan integrasi data Satker dari API Parquet
- **Manajemen User**: Kelola akun pengguna (khusus Superadmin)
- **Log Aktivitas**: Tracking semua aktivitas pengguna
- **Responsive Design**: Tampilan yang bagus di semua perangkat

## Teknologi yang Digunakan

### Backend
- NestJS 10.x
- MongoDB dengan Mongoose
- JWT Authentication
- bcrypt untuk password hashing
- Parquet.js untuk parsing data parquet

### Frontend
- Next.js 14.x
- React 18.x
- TypeScript
- Tailwind CSS
- Axios untuk HTTP client
- React Icons

## Persyaratan Sistem

- Node.js v22.20.0 (atau versi kompatibel)
- MongoDB 4.4 atau lebih baru
- npm atau yarn

## Instalasi

### 1. Clone atau Download Project

Pastikan Anda berada di direktori `d:\Data\Development\PBJ\Struktur Anggaran`

### 2. Setup Database MongoDB

Pastikan MongoDB berjalan di `mongodb://localhost:27017`

Database akan otomatis dibuat dengan nama `struktur-anggaran`

### 3. Instalasi Backend

```bash
cd backend
npm install
```

### 4. Instalasi Frontend

```bash
cd frontend
npm install
```

## Konfigurasi

### Backend (.env)

File `.env` sudah dibuat di folder `backend`:

```env
MONGODB_URI=mongodb://localhost:27017/struktur-anggaran
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION=7d
PORT=3001

# API data.pbj.my.id credentials
PBJ_API_USERNAME=admin
PBJ_API_PASSWORD=tetap semangat
```

**PENTING**:
- Ganti `JWT_SECRET` dengan secret key yang aman untuk production.
- Kredensial `PBJ_API_USERNAME` dan `PBJ_API_PASSWORD` digunakan untuk mengakses API data.pbj.my.id yang memerlukan basic authentication.

### Frontend (.env.local)

File `.env.local` sudah dibuat di folder `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Menjalankan Aplikasi

### 1. Jalankan Backend (Terminal 1)

```bash
cd backend
npm run start:dev
```

Backend akan berjalan di `http://localhost:3001`

Akun superadmin default akan otomatis dibuat:
- **Username**: superadmin
- **Password**: admin123

### 2. Jalankan Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

### 3. Akses Aplikasi

Buka browser dan akses `http://localhost:3000`

Login dengan kredensial:
- **Username**: superadmin
- **Password**: admin123

## Role & Permissions

### Superadmin
- Semua akses Admin
- Membuat dan mengelola akun Admin untuk OPD berbeda
- Mengelola user (CRUD)

### Admin
- Mengisi dan mengelola data struktur anggaran
- Melihat dashboard dan statistik
- Melihat log aktivitas

## Struktur Project

```
Struktur Anggaran/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── struktur-anggaran/  # Main data module
│   │   ├── logs/           # Activity logs
│   │   ├── satker/         # Satker data integration
│   │   ├── schemas/        # MongoDB schemas
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   │   ├── dashboard/
│   │   │   ├── struktur-anggaran/
│   │   │   ├── users/
│   │   │   └── logs/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   └── lib/          # Utilities
│   ├── package.json
│   └── .env.local
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login
- `GET /auth/profile` - Get user profile

### Users (Superadmin only)
- `GET /users` - List all users
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Struktur Anggaran
- `GET /struktur-anggaran` - List all (with tahun filter)
- `GET /struktur-anggaran/statistics` - Get statistics
- `POST /struktur-anggaran` - Create new entry
- `PATCH /struktur-anggaran/:id` - Update entry
- `DELETE /struktur-anggaran/:id` - Delete entry

### Satker
- `GET /satker?tahun=2025` - Get satker data from parquet API

### Logs
- `GET /logs` - Get activity logs
- `GET /logs/user/:userId` - Get logs by user

## Data Satker Integration

Aplikasi terintegrasi dengan API Parquet untuk data Master Satker:

```
https://data.pbj.my.id/rup/D197/RUP-MasterSatker/{tahun}/data.parquet
```

**Autentikasi API:**
- API ini memerlukan basic authentication
- Username: `admin`
- Password: `tetap semangat`
- Kredensial sudah dikonfigurasi di file `.env` backend

Data satker akan otomatis diload saat membuat struktur anggaran baru berdasarkan tahun yang dipilih.

## Production Build

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Troubleshooting

### Port sudah digunakan
Jika port 3000 atau 3001 sudah digunakan, ubah di:
- Backend: file `.env` (PORT=3001)
- Frontend: jalankan dengan `npm run dev -- -p 3002`

### MongoDB Connection Error
Pastikan MongoDB berjalan:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongodb
```

### Error saat install dependencies
Hapus folder `node_modules` dan `package-lock.json`, lalu install ulang:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Support

Untuk pertanyaan atau issue, silakan hubungi developer atau buat issue di repository.

## License

MIT License
