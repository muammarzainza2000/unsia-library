# UNSIA Digital Library - Backend API

Backend REST API untuk aplikasi Secure UNSIA Digital Library Dashboard.

## Teknologi yang Digunakan
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose ODM
- **Autentikasi:** JWT (JSON Web Token)
- **Password Hashing:** bcryptjs
- **Validasi:** express-validator
- **Keamanan:** Helmet, CORS, dotenv

## Cara Menjalankan Lokal

### 1. Clone dan Install Dependencies
```bash
cd backend
npm install
```

### 2. Konfigurasi Environment
```bash
# Salin file contoh
cp .env.example .env

# Edit .env dengan kredensial kamu
nano .env
```

### 3. Jalankan Server
```bash
# Mode development (auto-restart)
npm run dev

# Mode production
npm start
```

Server akan berjalan di: `http://localhost:5000`

## Struktur Endpoint API

| Method | Endpoint | Fungsi | Akses |
|--------|----------|--------|-------|
| POST | /api/auth/register | Registrasi user | Public |
| POST | /api/auth/login | Login & dapat JWT | Public |
| GET | /api/auth/me | Profil user aktif | Protected |
| GET | /api/books | List semua buku | Protected |
| POST | /api/books | Tambah buku | Protected |
| PUT | /api/books/:id | Update buku | Protected |
| DELETE | /api/books/:id | Hapus buku | Protected |
| GET | /api/members | List semua anggota | Protected |
| POST | /api/members | Tambah anggota | Protected |
| PUT | /api/members/:id | Update anggota | Protected |
| DELETE | /api/members/:id | Hapus anggota | Protected |
| GET | /api/loans | List peminjaman | Protected |
| POST | /api/loans | Buat peminjaman | Protected |
| PUT | /api/loans/:id/return | Kembalikan buku | Protected |
| GET | /api/dashboard/summary | Data dashboard | Protected |

## Contoh Request

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Admin UNSIA",
  "email": "admin@unsia.ac.id",
  "password": "password123"
}
```

### Login & Dapat Token
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@unsia.ac.id",
  "password": "password123"
}
```

### Gunakan Token di Request Protected
```bash
GET /api/books
Authorization: Bearer <token_dari_login>
```
