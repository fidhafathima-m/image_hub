import { IUser } from '../IUser.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  update(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  findByResetToken(tokenHash: string): Promise<IUser | null>;
  findOne(filter: any): Promise<IUser | null>;
  findOneWithRefreshToken(filter: any): Promise<IUser | null>;
}