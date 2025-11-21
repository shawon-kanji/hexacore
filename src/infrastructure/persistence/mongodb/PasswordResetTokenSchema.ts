import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordResetTokenDocument extends Document {
  _id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetTokenDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    tokenHash: {
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

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetTokenModel = mongoose.model<IPasswordResetTokenDocument>(
  'PasswordResetToken',
  PasswordResetTokenSchema
);
