import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshTokenDocument extends Document {
  _id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Create TTL index to automatically delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel = mongoose.model<IRefreshTokenDocument>(
  'RefreshToken',
  RefreshTokenSchema
);
