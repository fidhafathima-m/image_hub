import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface IUser extends Document {
  _id: ObjectId;
  userName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  refreshToken: string;
  refreshTokenExpires: Date | undefined
  comparePassword(candidatePassword: string): Promise<boolean>;
}