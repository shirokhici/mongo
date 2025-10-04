const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Admin Schema (copy dari model)
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'super_admin'],
    default: 'admin',
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const Admin = mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/android-browser');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('❌ Super admin already exists:', existingAdmin.username);
      process.exit(1);
    }

    // Create default super admin
    const username = 'admin';
    const password = 'admin123'; // Change this in production!
    const password_hash = await bcrypt.hash(password, 12);

    const admin = new Admin({
      username,
      password_hash,
      role: 'super_admin',
    });

    await admin.save();

    console.log('✅ Super admin created successfully!');
    console.log('📋 Login credentials:');
    console.log('   Username:', username);
    console.log('   Password:', password);
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin();