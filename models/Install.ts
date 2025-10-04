import mongoose, { Document, Schema } from 'mongoose';

export interface IInstall extends Document {
  _id: mongoose.Types.ObjectId;
  device_id: string;
  referrer: string;
  installed_at: Date;
  user_agent?: string;
  ip_address?: string;
}

const InstallSchema = new Schema<IInstall>({
  device_id: {
    type: String,
    required: [true, 'Device ID is required'],
    trim: true,
    minlength: [10, 'Device ID must be at least 10 characters'],
    maxlength: [200, 'Device ID cannot exceed 200 characters'],
  },
  referrer: {
    type: String,
    required: [true, 'Referrer is required'],
    trim: true,
    minlength: [2, 'Referrer must be at least 2 characters'],
    maxlength: [100, 'Referrer cannot exceed 100 characters'],
  },
  installed_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  user_agent: {
    type: String,
    trim: true,
    maxlength: [500, 'User agent cannot exceed 500 characters'],
  },
  ip_address: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        // Basic IP validation (IPv4 and IPv6)
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(v) || ipv6Regex.test(v);
      },
      message: 'IP address must be a valid IPv4 or IPv6 address',
    },
  },
}, {
  timestamps: false, // We use custom installed_at field
});

// Index untuk optimasi query
InstallSchema.index({ device_id: 1, referrer: 1 }, { unique: true }); // Prevent duplicate installs
InstallSchema.index({ referrer: 1 });
InstallSchema.index({ installed_at: -1 });
InstallSchema.index({ device_id: 1 });

const Install = mongoose.models.Install || mongoose.model<IInstall>('Install', InstallSchema);

export default Install;