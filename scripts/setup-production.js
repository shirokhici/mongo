// Script untuk setup admin di production
// Jalankan setelah deploy ke Vercel

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin Schema (copy dari models/Admin.ts)
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password_hash: {
    type: String,
    required: true,
    minlength: 60,
    maxlength: 60
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function setupProduction() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is required');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.username);
      return;
    }

    // Create super admin
    const password = 'admin123'; // Change this in production!
    const hashedPassword = await bcrypt.hash(password, 12);

    const superAdmin = new Admin({
      username: 'admin',
      password_hash: hashedPassword,
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log('Super admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error) {
    console.error('Error setting up production:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  setupProduction();
}

module.exports = setupProduction;