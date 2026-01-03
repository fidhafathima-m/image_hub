import { IUser } from "../IUser.js";

export interface IUserService {
  register(userData: {
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<{ user: IUser; token: string }>;
  login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }>;
  forgotPassword(email: string): Promise<{ resetToken: string; user: IUser }>;
  resetPassword(token: string, password: string): Promise<void>;
}
