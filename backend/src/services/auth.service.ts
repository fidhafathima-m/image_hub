import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";
import sgMail from "@sendgrid/mail";
import { IUser } from "../interfaces/IUser";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import User from "../models/UserSchema";

export class AuthService {
  private _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async register(userData: {
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<{ user: IUser; token: string }> {
    // Check if user exists
    const existingUser = await this._userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists, please login.");
    }

    // Create user
    const user = await this._userRepository.create({
      ...userData,
      email: userData.email.toLowerCase(),
    });

    // Generate JWT
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
  
  const user = await this._userRepository.findByEmail(email.toLowerCase());
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (!user.password) {
    throw new Error('Invalid credentials');
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
  } catch (error: any) {
    throw new Error('Invalid credentials');
  }

  // 4. Generate token
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  }); 
  
  return { user, token };
}

  async forgotPassword(
    email: string
  ): Promise<{ resetToken: string; user: IUser }> {
    const user = await this._userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    const hashToken = createHash("sha256").update(resetToken).digest("hex");

    await this._userRepository.update(user._id.toString(), {
      resetPasswordToken: hashToken,
      resetPasswordExpires: new Date(resetTokenExpiry),
    });

    // Send email
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔗 Reset link:",
        `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
      );
      return { resetToken, user };
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER || "",
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await sgMail.send(msg);
    return { resetToken, user };
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const hashToken = createHash("sha256").update(token).digest("hex");

    const user = await this._userRepository.findByResetToken(hashToken);
    if (!user) {
      throw new Error("Invalid or expired token");
    }

    await this._userRepository.update(user._id.toString(), {
      password,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }
}
