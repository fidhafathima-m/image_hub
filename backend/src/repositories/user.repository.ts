import { Model } from 'mongoose';
import { IUser } from '../interfaces/IUser';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import UserModel from '../models/UserSchema';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel as unknown as Model<IUser>);
  }

  // In user.repository.ts
async findByEmail(email: string): Promise<IUser | null> {
  const user = await this.model.findOne({ email: email.toLowerCase() }).select('+password');
  return user;
}

  async findById(id: string): Promise<IUser | null> {
    return this.model.findById(id);
  }

  async findByResetToken(tokenHash: string): Promise<IUser | null> {
    return this.model.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(id, updateData, { new: true });
  }
}