# Struktur Anggaran API Documentation

Dokumentasi lengkap untuk API Struktur Anggaran 2026. API ini dibangun dengan NestJS dan menggunakan MongoDB sebagai database.

## 📋 Daftar Isi

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#users-endpoints)
  - [Struktur Anggaran](#struktur-anggaran-endpoints)
  - [Satker](#satker-endpoints)
  - [Logs](#logs-endpoints)
- [Code Examples](#code-examples)
- [Swagger UI](#swagger-ui)

---

## Base URL

```
Production: https://your-domain.com
Development: http://localhost:3001
```

---

## Authentication

API ini menggunakan **JWT (JSON Web Token)** untuk autentikasi.

### Cara Mendapatkan Token

1. **Login** menggunakan endpoint `/auth/login`
2. Simpan `access_token` yang diterima dari response
3. Gunakan token pada setiap request dengan header:
   ```
   Authorization: Bearer {your_token}
   ```

### Token Expiration

- Default expiration: **7 hari**
- Setelah expired, user harus login ulang untuk mendapatkan token baru

### User Roles

API mendukung 2 role:

| Role | Deskripsi | Akses |
|------|-----------|-------|
| **superadmin** | Administrator utama | Full akses ke semua endpoint, dapat membuat user admin |
| **admin** | Administrator OPD | Dapat mengelola data struktur anggaran, hanya melihat log sendiri |

---

## Rate Limiting

Saat ini belum ada rate limiting. Untuk production, disarankan menggunakan rate limiting untuk mencegah abuse.

---

## Response Format

### Success Response

```json
{
  "data": {...},
  "message": "Success message (optional)"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Deskripsi |
|------|-----------|
| 200 | OK - Request berhasil |
| 201 | Created - Resource berhasil dibuat |
| 400 | Bad Request - Request tidak valid |
| 401 | Unauthorized - Token tidak valid atau belum login |
| 403 | Forbidden - Tidak memiliki permission |
| 404 | Not Found - Resource tidak ditemukan |
| 500 | Internal Server Error - Error di server |

---

## Endpoints

### Authentication Endpoints

#### 1. Login

**POST** `/auth/login`

Login dan mendapatkan JWT token.

**Request Body:**
```json
{
  "username": "superadmin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "695dcda204af73fd6ee66f9a",
    "email": "superadmin@struktur-anggaran.com",
    "username": "superadmin",
    "nama": "Super Administrator",
    "role": "superadmin"
  }
}
```

**Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

#### 2. Get Profile

**GET** `/auth/profile`

Mendapatkan profile user yang sedang login.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "_id": "695dcda204af73fd6ee66f9a",
  "email": "superadmin@struktur-anggaran.com",
  "username": "superadmin",
  "nama": "Super Administrator",
  "role": "superadmin",
  "status": "active"
}
```

---

### Users Endpoints

#### 1. Get All Users

**GET** `/users`

Mendapatkan semua user (khusus superadmin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "_id": "695dcda204af73fd6ee66f9a",
    "email": "superadmin@struktur-anggaran.com",
    "username": "superadmin",
    "nama": "Super Administrator",
    "role": "superadmin",
    "status": "active",
    "createdAt": "2026-01-07T03:06:10.509Z",
    "updatedAt": "2026-01-07T03:06:10.509Z"
  }
]
```

#### 2. Create User

**POST** `/users`

Membuat user baru (khusus superadmin).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "email": "admin@email.com",
  "username": "adminopd1",
  "password": "password123",
  "nama": "Admin OPD 1",
  "role": "admin"
}
```

**Response (201):**
```json
{
  "_id": "695efd8e6c87ea1e92bdaa74",
  "email": "admin@email.com",
  "username": "adminopd1",
  "nama": "Admin OPD 1",
  "role": "admin",
  "status": "active",
  "createdAt": "2026-01-08T00:42:54.454Z",
  "updatedAt": "2026-01-08T00:42:54.454Z"
}
```

#### 3. Update User

**PATCH** `/users/{id}`

Update user (khusus superadmin).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "nama": "Admin OPD 1 Updated",
  "status": "inactive"
}
```

**Response (200):**
```json
{
  "_id": "695efd8e6c87ea1e92bdaa74",
  "email": "admin@email.com",
  "username": "adminopd1",
  "nama": "Admin OPD 1 Updated",
  "role": "admin",
  "status": "inactive",
  "updatedAt": "2026-01-08T01:00:00.000Z"
}
```

#### 4. Delete User

**DELETE** `/users/{id}`

Hapus user (khusus superadmin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Struktur Anggaran Endpoints

#### 1. Get All Struktur Anggaran

**GET** `/struktur-anggaran`

Mendapatkan semua data struktur anggaran.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `tahun` (optional): Filter berdasarkan tahun (contoh: 2025)

**Example:**
```
GET /struktur-anggaran?tahun=2025
```

**Response (200):**
```json
[
  {
    "_id": "695f0d1a6c87ea1e92bdaa9c",
    "tahun_anggaran": 2025,
    "kd_klpd": "D197",
    "nama_klpd": "Pemerintah Kota Semarang",
    "kd_satker": "123456",
    "kd_satker_str": "123456",
    "nama_satker": "Dinas Pendidikan",
    "belanja_operasi": 1000000000,
    "belanja_modal": 500000000,
    "belanja_bbt": 250000000,
    "belanja_non_pengadaan": 100000000,
    "belanja_pengadaan": 650000000,
    "total_belanja": 1750000000,
    "tahun": 2025,
    "createdAt": "2026-01-08T01:52:42.123Z",
    "updatedAt": "2026-01-08T01:52:42.123Z"
  }
]
```

#### 2. Get Statistics

**GET** `/struktur-anggaran/statistics`

Mendapatkan statistik belanja.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `tahun` (optional): Filter berdasarkan tahun

**Example:**
```
GET /struktur-anggaran/statistics?tahun=2025
```

**Response (200):**
```json
{
  "totalSatker": 50,
  "totalBelanja": 50000000000,
  "totalBelanjaOperasi": 30000000000,
  "totalBelanjaModal": 15000000000,
  "totalBelanjaBBT": 5000000000,
  "totalBelanjaPengadaan": 20000000000,
  "totalBelanjaNonPengadaan": 30000000000
}
```

#### 3. Create Struktur Anggaran

**POST** `/struktur-anggaran`

Membuat data struktur anggaran baru.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "tahun_anggaran": 2025,
  "kd_klpd": "D197",
  "nama_klpd": "Pemerintah Kota Semarang",
  "kd_satker": "123456",
  "kd_satker_str": "123456",
  "nama_satker": "Dinas Pendidikan",
  "belanja_operasi": 1000000000,
  "belanja_modal": 500000000,
  "belanja_bbt": 250000000,
  "belanja_non_pengadaan": 100000000,
  "belanja_pengadaan": 650000000,
  "total_belanja": 1750000000,
  "tahun": 2025
}
```

**Response (201):**
```json
{
  "_id": "695f0d1a6c87ea1e92bdaa9c",
  "tahun_anggaran": 2025,
  "kd_klpd": "D197",
  "nama_klpd": "Pemerintah Kota Semarang",
  "kd_satker": "123456",
  "kd_satker_str": "123456",
  "nama_satker": "Dinas Pendidikan",
  "belanja_operasi": 1000000000,
  "belanja_modal": 500000000,
  "belanja_bbt": 250000000,
  "belanja_non_pengadaan": 100000000,
  "belanja_pengadaan": 650000000,
  "total_belanja": 1750000000,
  "tahun": 2025,
  "createdAt": "2026-01-08T01:52:42.123Z",
  "updatedAt": "2026-01-08T01:52:42.123Z"
}
```

#### 4. Update Struktur Anggaran

**PATCH** `/struktur-anggaran/{id}`

Update data struktur anggaran.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "belanja_operasi": 1100000000,
  "total_belanja": 1850000000
}
```

**Response (200):**
```json
{
  "_id": "695f0d1a6c87ea1e92bdaa9c",
  "belanja_operasi": 1100000000,
  "total_belanja": 1850000000,
  "updatedAt": "2026-01-08T02:00:00.000Z"
}
```

#### 5. Delete Struktur Anggaran

**DELETE** `/struktur-anggaran/{id}`

Hapus data struktur anggaran.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Data deleted successfully"
}
```

---

### Satker Endpoints

#### 1. Get Satker Data

**GET** `/satker`

Mendapatkan data satker dari API eksternal (data.pbj.my.id).

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `tahun` (optional): Tahun data yang ingin diambil (default: tahun sekarang)

**Example:**
```
GET /satker?tahun=2025
```

**Response (200):**
```json
[
  {
    "kd_klpd": "D197",
    "nama_klpd": "Pemerintah Kota Semarang",
    "kd_satker": "123456",
    "kd_satker_str": "123456",
    "nama_satker": "Dinas Pendidikan"
  },
  {
    "kd_klpd": "D197",
    "nama_klpd": "Pemerintah Kota Semarang",
    "kd_satker": "123457",
    "kd_satker_str": "123457",
    "nama_satker": "Dinas Kesehatan"
  }
]
```

#### 2. Get Satker by Code

**GET** `/satker/{kdSatker}`

Mendapatkan data satker berdasarkan kode satker.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `tahun` (optional): Tahun data

**Example:**
```
GET /satker/123456?tahun=2025
```

**Response (200):**
```json
{
  "kd_klpd": "D197",
  "nama_klpd": "Pemerintah Kota Semarang",
  "kd_satker": "123456",
  "kd_satker_str": "123456",
  "nama_satker": "Dinas Pendidikan"
}
```

---

### Logs Endpoints

#### 1. Get All Logs

**GET** `/logs`

Mendapatkan activity logs.

**Akses Berdasarkan Role:**
- **Admin**: Hanya melihat log mereka sendiri
- **Superadmin**: Melihat semua log

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Batasi jumlah log yang ditampilkan

**Example:**
```
GET /logs?limit=50
```

**Response (200):**
```json
[
  {
    "_id": "695f1234...",
    "userId": "695dcda204af73fd6ee66f9a",
    "username": "superadmin",
    "action": "CREATE",
    "entity": "struktur-anggaran",
    "entityId": "695f0d1a6c87ea1e92bdaa9c",
    "details": "Created struktur anggaran for Dinas Pendidikan",
    "timestamp": "2026-01-08T02:10:00.000Z"
  }
]
```

#### 2. Get Logs by User

**GET** `/logs/user/{userId}`

Mendapatkan logs user tertentu.

**Akses:**
- **Admin**: Hanya bisa akses log mereka sendiri (userId harus sama)
- **Superadmin**: Bisa akses log user manapun

**Headers:**
```
Authorization: Bearer {token}
```

**Example:**
```
GET /logs/user/695dcda204af73fd6ee66f9a
```

**Response (200):**
```json
[
  {
    "_id": "695f1234...",
    "userId": "695dcda204af73fd6ee66f9a",
    "username": "superadmin",
    "action": "CREATE",
    "entity": "struktur-anggaran",
    "entityId": "695f0d1a6c87ea1e92bdaa9c",
    "details": "Created struktur anggaran for Dinas Pendidikan",
    "timestamp": "2026-01-08T02:10:00.000Z"
  }
]
```

**Response (403) - Admin mencoba akses log user lain:**
```json
{
  "statusCode": 403,
  "message": "You can only view your own logs",
  "error": "Forbidden"
}
```

---

## Code Examples

### JavaScript/Node.js (Axios)

#### 1. Login dan Simpan Token

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'superadmin',
      password: 'admin123'
    });

    const token = response.data.access_token;
    console.log('Token:', token);

    // Simpan token (gunakan secure storage di production)
    localStorage.setItem('token', token);

    return token;
  } catch (error) {
    console.error('Login failed:', error.response.data);
    throw error;
  }
}

login();
```

#### 2. Get Data dengan Authorization

```javascript
async function getStrukturAnggaran(tahun) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(`${API_URL}/struktur-anggaran`, {
      params: { tahun },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);

    // Handle 401 - Token expired or invalid
    if (error.response.status === 401) {
      console.log('Token invalid, please login again');
      // Redirect to login
    }

    throw error;
  }
}

getStrukturAnggaran(2025);
```

#### 3. Create Data

```javascript
async function createStrukturAnggaran(data) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(`${API_URL}/struktur-anggaran`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
}

const newData = {
  tahun_anggaran: 2025,
  kd_klpd: 'D197',
  nama_klpd: 'Pemerintah Kota Semarang',
  kd_satker: '123456',
  kd_satker_str: '123456',
  nama_satker: 'Dinas Pendidikan',
  belanja_operasi: 1000000000,
  belanja_modal: 500000000,
  belanja_bbt: 250000000,
  belanja_non_pengadaan: 100000000,
  belanja_pengadaan: 650000000,
  total_belanja: 1750000000,
  tahun: 2025
};

createStrukturAnggaran(newData);
```

### Python (Requests)

#### 1. Login

```python
import requests

API_URL = 'http://localhost:3001'

def login(username, password):
    response = requests.post(f'{API_URL}/auth/login', json={
        'username': username,
        'password': password
    })

    if response.status_code == 200:
        token = response.json()['access_token']
        print(f'Token: {token}')
        return token
    else:
        print(f'Login failed: {response.json()}')
        return None

token = login('superadmin', 'admin123')
```

#### 2. Get Data

```python
def get_struktur_anggaran(token, tahun=None):
    headers = {
        'Authorization': f'Bearer {token}'
    }

    params = {'tahun': tahun} if tahun else {}

    response = requests.get(
        f'{API_URL}/struktur-anggaran',
        headers=headers,
        params=params
    )

    if response.status_code == 200:
        return response.json()
    else:
        print(f'Error: {response.json()}')
        return None

data = get_struktur_anggaran(token, 2025)
print(data)
```

### PHP (cURL)

#### 1. Login

```php
<?php
$api_url = 'http://localhost:3001';

function login($username, $password) {
    global $api_url;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$api_url/auth/login");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'username' => $username,
        'password' => $password
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);
    return $data['access_token'];
}

$token = login('superadmin', 'admin123');
echo "Token: $token\n";
?>
```

#### 2. Get Data

```php
<?php
function getStrukturAnggaran($token, $tahun = null) {
    global $api_url;

    $url = "$api_url/struktur-anggaran";
    if ($tahun) {
        $url .= "?tahun=$tahun";
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token"
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

$data = getStrukturAnggaran($token, 2025);
print_r($data);
?>
```

---

## Swagger UI

Untuk testing dan eksplorasi API yang lebih mudah, gunakan **Swagger UI** yang tersedia di:

```
http://localhost:3001/api
```

### Cara Menggunakan Swagger UI:

1. **Buka browser** dan akses `http://localhost:3001/api`

2. **Login untuk mendapatkan token:**
   - Buka endpoint `POST /auth/login`
   - Klik "Try it out"
   - Masukkan credentials:
     ```json
     {
       "username": "superadmin",
       "password": "admin123"
     }
     ```
   - Klik "Execute"
   - Copy `access_token` dari response

3. **Authorize:**
   - Klik tombol **"Authorize"** (gembok) di kanan atas
   - Paste token di field "Value" (tanpa kata "Bearer")
   - Klik "Authorize" lalu "Close"

4. **Test Endpoints:**
   - Pilih endpoint yang ingin ditest
   - Klik "Try it out"
   - Isi parameter yang diperlukan
   - Klik "Execute"

---

## Best Practices

### 1. Security

- **Jangan hardcode credentials** di kode
- **Simpan token dengan aman**:
  - Di browser: gunakan `httpOnly` cookies atau secure storage
  - Di mobile: gunakan Keychain (iOS) atau Keystore (Android)
  - Di backend: gunakan environment variables
- **Gunakan HTTPS** di production
- **Implement rate limiting** untuk mencegah brute force
- **Validate input** sebelum mengirim ke API

### 2. Error Handling

```javascript
async function apiCall() {
  try {
    const response = await axios.get('/endpoint', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      switch(error.response.status) {
        case 401:
          // Token invalid, redirect to login
          redirectToLogin();
          break;
        case 403:
          // Forbidden
          showError('You do not have permission');
          break;
        case 404:
          // Not found
          showError('Data not found');
          break;
        case 500:
          // Server error
          showError('Server error, please try again later');
          break;
        default:
          showError(error.response.data.message);
      }
    } else if (error.request) {
      // Request made but no response
      showError('Network error, please check your connection');
    } else {
      // Other errors
      showError('An error occurred');
    }
  }
}
```

### 3. Token Management

```javascript
// Axios interceptor untuk auto-attach token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Support

Untuk pertanyaan atau issue:
- **Repository**: https://github.com/your-repo/struktur-anggaran
- **Email**: support@your-domain.com

---

## Changelog

### Version 1.0.0 (2026-01-08)
- Initial release
- Authentication with JWT
- CRUD operations for Struktur Anggaran
- User management
- Activity logs
- Satker data integration
- Swagger documentation

---

## License

Copyright © 2026 Struktur Anggaran. All rights reserved.
