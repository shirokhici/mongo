# Android Browser Backend & Admin Panel

Full-stack application untuk mengelola konfigurasi browser Android dengan admin panel yang lengkap.

## 🚀 Features

### Backend API
- **Authentication**: JWT-based authentication dengan bcrypt password hashing
- **Config Management**: CRUD operations untuk browser configurations
- **Install Tracking**: Monitoring dan analytics install data
- **File Upload**: Secure file upload untuk icons dan assets
- **RESTful API**: Clean API endpoints untuk integrasi Android app

### Admin Panel
- **Dashboard**: Overview statistics dan analytics
- **Config Management**: Create, read, update, delete browser configurations
- **Install Analytics**: Monitor install data dengan filtering dan export
- **Responsive UI**: Modern interface dengan Tailwind CSS
- **Secure Access**: Protected routes dengan middleware authentication

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB dengan Mongoose
- **Authentication**: JWT + bcrypt
- **Styling**: Tailwind CSS
- **File Upload**: Formidable
- **Icons**: Lucide React

## 📦 Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` dengan konfigurasi Anda:
   ```env
   MONGO_URI=mongodb://localhost:27017/android-browser
   JWT_SECRET=your-super-secret-jwt-key
   NEXTAUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Setup MongoDB**
   - Install dan jalankan MongoDB
   - Atau gunakan MongoDB Atlas untuk cloud database

5. **Create admin user**
   ```bash
   node scripts/create-admin.js
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/config?ref=xxx` - Get config by referrer
- `POST /api/register-install` - Register app install
- `GET /api/uploads/[...path]` - Serve uploaded files

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Admin Endpoints (Protected)
- `GET /api/admin/config` - List all configs
- `POST /api/admin/config` - Create new config
- `GET /api/admin/config/[id]` - Get config by ID
- `PUT /api/admin/config/[id]` - Update config
- `DELETE /api/admin/config/[id]` - Delete config
- `GET /api/admin/installs` - Get install analytics
- `POST /api/upload` - Upload files

## 📱 Android Integration

### Get Configuration
```kotlin
// GET /api/config?ref=promoA
val response = httpClient.get("https://yourapi.com/api/config?ref=promoA")
val config = response.body<ConfigResponse>()
```

### Register Install
```kotlin
// POST /api/register-install
val installData = mapOf(
    "device_id" to deviceId,
    "referrer" to "promoA"
)
httpClient.post("https://yourapi.com/api/register-install") {
    contentType(ContentType.Application.Json)
    setBody(installData)
}
```

## 🎨 Admin Panel

### Access Admin Panel
1. Navigate to `http://localhost:3000/admin`
2. Login dengan credentials default:
   - Username: `admin`
   - Password: `admin123`

### Features
- **Dashboard**: Statistics dan overview
- **Configurations**: Manage browser configs
- **Install Analytics**: Monitor dan export data
- **Responsive Design**: Works on desktop dan mobile

## 🗄️ Database Schema

### Config Collection
```javascript
{
  referrer: String,        // Unique referrer key
  icon_url: String,        // App icon URL
  homepage: String,        // Default homepage URL
  ads: [{                  // Ad configurations
    type: String,          // banner, interstitial, native
    url: String,           // Ad URL
    image_url: String,     // Ad image (optional)
    title: String,         // Ad title (optional)
    description: String    // Ad description (optional)
  }],
  created_at: Date,
  updated_at: Date
}
```

### Install Collection
```javascript
{
  device_id: String,       // Unique device identifier
  referrer: String,        // Referrer key
  installed_at: Date,      // Install timestamp
  user_agent: String,      // Device user agent
  ip_address: String       // Client IP address
}
```

### Admin Collection
```javascript
{
  username: String,        // Admin username
  password_hash: String,   // Bcrypt hashed password
  role: String,           // admin, super_admin
  created_at: Date,
  updated_at: Date
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt untuk password security
- **Route Protection**: Middleware untuk protected routes
- **Input Validation**: Comprehensive input validation
- **File Upload Security**: Secure file handling
- **CORS Configuration**: Proper CORS setup

## 🚀 Deployment

### Vercel Deployment
1. **Push ke GitHub**
2. **Connect ke Vercel**
3. **Set environment variables**:
   ```env
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/android-browser
   JWT_SECRET=your-production-jwt-secret
   NEXTAUTH_URL=https://yourdomain.vercel.app
   NODE_ENV=production
   ```

### VPS Deployment
1. **Setup server** (Ubuntu/CentOS)
2. **Install Node.js dan MongoDB**
3. **Clone repository**
4. **Install dependencies**
5. **Set environment variables**
6. **Run dengan PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "android-browser" -- start
   ```

## 📝 Development

### Project Structure
```
├── app/                 # Next.js App Router
│   ├── admin/          # Admin panel pages
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/         # React components
├── lib/               # Utility libraries
├── models/            # MongoDB models
├── public/            # Static files
├── scripts/           # Utility scripts
└── utils/             # Helper functions
```

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint check

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

Untuk pertanyaan atau issues, silakan buat GitHub issue atau hubungi tim development.