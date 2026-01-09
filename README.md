# Struktur Anggaran 2026

Aplikasi manajemen Struktur Anggaran untuk Pemerintah Kota menggunakan Next.js dan NestJS.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## ✨ Fitur

- ✅ **Authentication & Authorization** dengan JWT
- ✅ **Role-based Access Control** (Superadmin & Admin)
- ✅ **CRUD Struktur Anggaran** dengan format Rupiah
- ✅ **Integrasi API Satker** dari data.pbj.my.id
- ✅ **Activity Logs** dengan permission berdasarkan role
- ✅ **Dashboard Statistics** dengan visualisasi data
- ✅ **User Management** untuk Superadmin
- ✅ **Responsive Design** dengan Tailwind CSS
- ✅ **API Documentation** dengan Swagger UI

---

## 🛠️ Teknologi

### Backend
- **NestJS** 10.x - Progressive Node.js framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Token untuk authentication
- **Passport.js** - Authentication middleware
- **Swagger** - API documentation
- **bcrypt** - Password hashing

### Frontend
- **Next.js** 14.x - React framework dengan App Router
- **React** 18.x
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Icons** - Icon library

---

## 📦 Prasyarat

Sebelum memulai, pastikan Anda telah menginstall:

- **Node.js** v18.x atau lebih tinggi
- **npm** atau **yarn**
- **MongoDB** v6.x atau lebih tinggi
- **Git** (optional)

### Cek Versi

\`\`\`bash
node --version  # Harus v18.x atau lebih tinggi
npm --version
mongod --version  # MongoDB harus sudah running
\`\`\`

---

## 🚀 Instalasi

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/your-repo/struktur-anggaran.git
cd struktur-anggaran
\`\`\`

### 2. Install Dependencies

#### Backend
\`\`\`bash
cd backend
npm install
\`\`\`

#### Frontend
\`\`\`bash
cd ../frontend
npm install
\`\`\`

---

## ⚙️ Konfigurasi

### 1. Setup MongoDB

Pastikan MongoDB sudah running:

\`\`\`bash
# Windows (jika menggunakan MongoDB service)
net start MongoDB

# Linux/Mac
sudo systemctl start mongod

# Atau jalankan mongod secara manual
mongod --dbpath /path/to/your/data
\`\`\`

### 2. Konfigurasi Backend

File \`.env\` sudah ada di folder \`backend/\`. Edit sesuai kebutuhan:

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/struktur-anggaran
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION=7d
PORT=3001

# API data.pbj.my.id credentials
PBJ_API_USERNAME=admin
PBJ_API_PASSWORD=tetapsemangat
\`\`\`

**⚠️ PENTING:** Ganti \`JWT_SECRET\` dengan string random yang kuat untuk production!

### 3. Konfigurasi Frontend

Buat file \`.env.local\` di folder \`frontend/\`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

---

## 🏃 Menjalankan Aplikasi

### Mode Development

#### 1. Jalankan Backend

\`\`\`bash
cd backend
npm run start:dev
\`\`\`

Backend akan berjalan di: **http://localhost:3001**

- API: http://localhost:3001
- Swagger UI: http://localhost:3001/api

#### 2. Jalankan Frontend

Buka terminal baru:

\`\`\`bash
cd frontend
npm run dev
\`\`\`

Frontend akan berjalan di: **http://localhost:3000**

---

## 📚 API Documentation

### Swagger UI

Dokumentasi API interaktif tersedia di:
\`\`\`
http://localhost:3001/api
\`\`\`

### API Documentation File

Dokumentasi lengkap API tersedia di:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Start API

1. **Login**
\`\`\`bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'
\`\`\`

2. **Get Data (dengan token)**
\`\`\`bash
curl -X GET http://localhost:3001/struktur-anggaran?tahun=2025 \
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

---

## 👥 User Roles

### Default Superadmin

Aplikasi secara otomatis membuat user superadmin saat pertama kali dijalankan:

\`\`\`
Username: superadmin
Password: admin123
Role: superadmin
\`\`\`

**⚠️ PENTING:** Ganti password default ini setelah login pertama kali!

### Role Permissions

| Fitur | Admin | Superadmin |
|-------|-------|------------|
| Login | ✅ | ✅ |
| Dashboard | ✅ | ✅ |
| CRUD Struktur Anggaran | ✅ | ✅ |
| View Own Logs | ✅ | ✅ |
| View All Logs | ❌ | ✅ |
| Create Admin Users | ❌ | ✅ |
| Manage Users | ❌ | ✅ |

---

## 📁 Project Structure

\`\`\`
struktur-anggaran/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── struktur-anggaran/  # Budget structure
│   │   ├── satker/         # Satker data integration
│   │   ├── logs/           # Activity logs
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── schemas/        # MongoDB schemas
│   │   └── main.ts         # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── login/     # Login page
│   │   │   ├── dashboard/ # Dashboard
│   │   │   ├── struktur-anggaran/  # Budget CRUD
│   │   │   ├── users/     # User management
│   │   │   └── logs/      # Activity logs
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities & API client
│   ├── .env.local         # Environment variables
│   └── package.json
│
├── API_DOCUMENTATION.md   # API docs
├── README.md             # This file
└── QUICK_START.txt       # Quick reference
\`\`\`

---

## 🔒 Security Notes

### Production Checklist

- [ ] Ganti JWT_SECRET dengan nilai random yang kuat
- [ ] Ganti password default superadmin
- [ ] Gunakan HTTPS untuk semua komunikasi
- [ ] Enable CORS hanya untuk domain yang dipercaya
- [ ] Implement rate limiting
- [ ] Setup firewall untuk MongoDB
- [ ] Enable MongoDB authentication
- [ ] Regular backup database

### Generate Strong JWT Secret

\`\`\`bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

---

## 📝 Scripts

### Backend Scripts

\`\`\`bash
npm run start:dev    # Development mode with hot reload
npm run start:prod   # Production mode
npm run build        # Build for production
\`\`\`

### Frontend Scripts

\`\`\`bash
npm run dev         # Development server
npm run build       # Build for production
npm run start       # Start production server
\`\`\`

---

## 📄 License

Copyright © 2026 Struktur Anggaran. All rights reserved.

---

**Happy Coding! 🚀**
