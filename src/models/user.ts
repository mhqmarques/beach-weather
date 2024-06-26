import logger from '@src/logger';
import { AuthService } from '@src/services/authService';
import mongoose, { Document, Model } from 'mongoose';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

export interface UserModel extends Omit<User, '_id'>, Document {}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        (ret.id = ret._id), delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userSchema.path('email').validate(
  async (email: string) => {
    const emailCount = await mongoose.models.User.countDocuments({ email });
    return !emailCount;
  },
  'already exists in database',
  CUSTOM_VALIDATION.DUPLICATED
);

userSchema.pre('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  try {
    const hashedPassword = await AuthService.hashPassword(this.password);
    this.password = hashedPassword;
  } catch (error) {
    logger.error(`error hashing the password for the user ${this.name}`);
  }
});

export const User: Model<UserModel> = mongoose.model<UserModel>(
  'User',
  userSchema
);
