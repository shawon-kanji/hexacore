import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'USER',
    },
    age: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
