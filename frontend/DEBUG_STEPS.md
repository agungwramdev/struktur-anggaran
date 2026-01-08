# DEBUG STEPS - Login Issue

## Tolong lakukan ini di browser:

### 1. Clear Everything
- F12 → Console tab
- Ketik: `localStorage.clear()`
- Enter
- Refresh page (F5)

### 2. Login dengan Console Terbuka
- Username: superadmin
- Password: admin123
- **JANGAN CLOSE CONSOLE!**

### 3. Cek Console Messages
Setelah klik Login, lihat di Console tab:
- Ada error merah?
- Ada pesan "Login error"?
- Ada request yang failed?

### 4. Cek Network Tab
- F12 → Network tab
- Filter: Fetch/XHR
- Cari request yang failed (merah)
- Klik dan lihat:
  - Status code berapa?
  - Response apa?

### 5. Cek LocalStorage
**SEBELUM redirect:**
- F12 → Console
- Ketik: `localStorage.getItem('token')`
- Ada value-nya?

**SETELAH redirect ke dashboard:**
- F12 → Application → Local Storage → http://localhost:3000
- Apakah `token` dan `user` masih ada?
- Atau sudah hilang?

### 6. Cek Request /auth/login
- Network tab
- Cari request ke: `http://localhost:3001/auth/login`
- Status: 200?
- Response body: ada `access_token` dan `user`?

### 7. Cek Request di Dashboard
Setelah redirect ke dashboard:
- Ada request ke `/struktur-anggaran/statistics`?
- Status code berapa?
- Jika 401: Ini masalahnya!

## Copy dan Kirim Info Ini:

1. Console errors (screenshot atau copy text)
2. Network failed requests (nama dan status code)
3. localStorage value setelah login
4. Apakah token hilang setelah redirect?
