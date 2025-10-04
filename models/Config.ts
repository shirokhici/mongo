import mongoose, { Document, Schema } from 'mongoose';

export interface IConfig extends Document {
  _id: mongoose.Types.ObjectId;
  referrer: string;
  icon_url: string;
  homepage: string;
  ads: string[];
  created_at: Date;
  updated_at: Date;
}

const ConfigSchema = new Schema<IConfig>({
  referrer: {
    type: String,
    required: [true, 'Referrer is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Referrer must be at least 2 characters'],
    maxlength: [100, 'Referrer cannot exceed 100 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Referrer can only contain letters, numbers, underscores, and hyphens'],
  },
  icon_url: {
    type: String,
    required: [true, 'Icon URL is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\/uploads\/.*\.(jpg|jpeg|png|gif|svg|webp)$/i.test(v);
      },
      message: 'Icon URL must be a valid image file in /uploads/ directory',
    },
  },
  homepage: {
    type: String,
    required: [true, 'Homepage URL is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Homepage must be a valid URL',
    },
  },
  ads: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\/uploads\/.*\.(jpg|jpeg|png|gif|svg|webp)$/i.test(v);
      },
      message: 'Ad URL must be a valid image file in /uploads/ directory',
    },
  }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Index untuk optimasi query
ConfigSchema.index({ referrer: 1 });
ConfigSchema.index({ created_at: -1 });

const Config = mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema);

export default Config;