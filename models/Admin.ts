import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

const AdminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
  },
  password_hash: {
    type: String,
    required: [true, 'Password hash is required'],
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'super_admin'],
    default: 'admin',
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Index untuk optimasi query
AdminSchema.index({ username: 1 });

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;