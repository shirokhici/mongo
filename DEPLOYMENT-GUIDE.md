# 🚀 Panduan Deploy ke Vercel

## 📋 Persiapan

✅ **MongoDB Atlas sudah siap**: `mongodb+srv://ocean_mongo:Sidikalang@27@mongo.hvkctp9.mongodb.net/...`  
✅ **Project sudah dikonfigurasi** dengan semua file yang diperlukan  
✅ **Environment variables sudah disiapkan**

---

## 🔧 Langkah 1: Push ke GitHub

### 1.1 Inisialisasi Git Repository
```bash
git init
git add .
git commit -m "Initial commit - Android Browser Backend"
```

### 1.2 Buat Repository di GitHub
1. Buka https://github.com/new
2. Nama repository: `android-browser-backend`
3. Set sebagai **Public** atau **Private**
4. **Jangan** centang "Add README" (sudah ada)

### 1.3 Push ke GitHub
```bash
git branch -M main
git remote add origin https://github.com/USERNAME/android-browser-backend.git
git push -u origin main
```

---

## 🌐 Langkah 2: Deploy ke Vercel

### 2.1 Login ke Vercel
1. Buka https://vercel.com/
2. Login dengan GitHub account
3. Authorize Vercel untuk akses repository

### 2.2 Import Project
1. Click **"New Project"**
2. **Import** repository `android-browser-backend`
3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2.3 Deploy
1. Click **"Deploy"**
2. Tunggu proses build selesai (2-3 menit)
3. Jika ada error, check build logs

---

## ⚙️ Langkah 3: Setup Environment Variables

### 3.1 Buka Project Settings
1. Masuk ke project di Vercel Dashboard
2. Go to **Settings** → **Environment Variables**

### 3.2 Tambahkan Variables
Tambahkan environment variables berikut:

| **Name** | **Value** |
|----------|-----------|
| `MONGO_URI` | `mongodb+srv://ocean_mongo:Sidikalang@27@mongo.hvkctp9.mongodb.net/android-browser?retryWrites=true&w=majority&appName=Mongo` |
| `JWT_SECRET` | `ocean-super-secret-jwt-key-production-2024-change-this` |
| `NEXTAUTH_URL` | `https://your-project-name.vercel.app` |
| `NODE_ENV` | `production` |

### 3.3 Update NEXTAUTH_URL
1. Setelah deploy, copy URL Vercel (contoh: `https://android-browser-backend.vercel.app`)
2. Update `NEXTAUTH_URL` dengan URL tersebut
3. **Redeploy** project

---

## 👤 Langkah 4: Setup Admin User

### 4.1 Clone Repository Locally
```bash
git clone https://github.com/USERNAME/android-browser-backend.git
cd android-browser-backend
```

### 4.2 Install Dependencies
```bash
npm install
```

### 4.3 Setup Environment
Buat file `.env.local`:
```env
MONGO_URI=mongodb+srv://ocean_mongo:Sidikalang@27@mongo.hvkctp9.mongodb.net/android-browser?retryWrites=true&w=majority&appName=Mongo
JWT_SECRET=ocean-super-secret-jwt-key-production-2024-change-this
NEXTAUTH_URL=https://your-project-name.vercel.app
NODE_ENV=production
```

### 4.4 Create Admin User
```bash
node scripts/setup-production.js
```

**Output yang diharapkan:**
```
✅ Super admin created successfully!
Username: admin
Password: admin123
⚠️  IMPORTANT: Change the default password after first login!
```

---

## 🧪 Langkah 5: Testing

### 5.1 Test Website
1. **Buka URL Vercel**: `https://your-project-name.vercel.app`
2. **Test Admin Login**: `https://your-project-name.vercel.app/admin/login`
   - Username: `admin`
   - Password: `admin123`

### 5.2 Test API Endpoints
```bash
# Test Config API
curl "https://your-project-name.vercel.app/api/config?referrer=test"

# Test Install Registration
curl -X POST "https://your-project-name.vercel.app/api/register-install" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test123","referrer":"test"}'
```

### 5.3 Test Admin Panel
1. **Dashboard**: Lihat statistik
2. **Configurations**: Buat config baru
3. **Install Data**: Lihat data install
4. **File Upload**: Test upload file

---

## 🔒 Langkah 6: Security (PENTING!)

### 6.1 Ganti Password Default
1. Login ke admin panel
2. Buat admin user baru dengan password kuat
3. Hapus user `admin` default

### 6.2 Update JWT Secret
1. Generate JWT secret baru yang kuat
2. Update di Vercel Environment Variables
3. Redeploy

### 6.3 MongoDB Atlas Security
1. **IP Whitelist**: Set ke IP spesifik (bukan 0.0.0.0/0)
2. **Database User**: Gunakan password yang kuat
3. **Network Access**: Enable hanya dari Vercel

---

## 📱 Langkah 7: Android Integration

### 7.1 Update Android App
Ganti base URL di Android app:
```kotlin
const val BASE_URL = "https://your-project-name.vercel.app/api/"
```

### 7.2 Test API dari Android
```kotlin
// Get Config
GET https://your-project-name.vercel.app/api/config?referrer=your-app-name

// Register Install
POST https://your-project-name.vercel.app/api/register-install
{
  "device_id": "unique-device-id",
  "referrer": "your-app-name"
}
```

---

## 🎯 URL Penting

Setelah deploy berhasil:

- **Website**: `https://your-project-name.vercel.app`
- **Admin Panel**: `https://your-project-name.vercel.app/admin`
- **API Base**: `https://your-project-name.vercel.app/api`
- **Config API**: `https://your-project-name.vercel.app/api/config?referrer=your-app`

---

## 🚨 Troubleshooting

### Build Error
- Check build logs di Vercel Dashboard
- Pastikan semua dependencies ada di `package.json`
- Check TypeScript errors

### Database Connection Error
- Verify MongoDB Atlas connection string
- Check IP whitelist di MongoDB Atlas
- Verify database user credentials

### Environment Variables Error
- Pastikan semua env vars sudah diset
- Check spelling dan format
- Redeploy setelah update env vars

### File Upload Error
- File upload di Vercel memiliki limit 4.5MB
- Untuk file besar, gunakan Vercel Blob atau AWS S3

---

## ✅ Checklist Deploy

- [ ] Repository pushed ke GitHub
- [ ] Project deployed ke Vercel
- [ ] Environment variables configured
- [ ] Admin user created
- [ ] Website accessible
- [ ] Admin panel working
- [ ] API endpoints tested
- [ ] Android app updated
- [ ] Security configured
- [ ] Default password changed

---

**🎉 Selamat! Aplikasi Anda sudah live di Vercel!**