import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";
import sgMail from "@sendgrid/mail";
import { IUser } from "../interfaces/IUser.js";
import { IUserRepository } from "../interfaces/repositories/IUserRepository.js";
import User from "../models/UserSchema.js";

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
  }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
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

    const { accessToken, refreshToken } = this.generateTokens(
      user._id.toString()
    );

    // Save refresh token to user
    await this._userRepository.update(user._id.toString(), {
      refreshToken,
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { user, accessToken, refreshToken };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this._userRepository.findByEmail(email.toLowerCase());

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.password) {
      throw new Error("Invalid credentials");
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error("Invalid credentials");
      }
    } catch (error: any) {
      throw new Error("Invalid credentials");
    }

    // 4. Generate token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user._id.toString()
    );

    // Save refresh token to user
    await this._userRepository.update(user._id.toString(), {
      refreshToken,
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { user, accessToken, refreshToken };
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

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    ) as { userId: string };

    // Use the new method to find user with refresh token
    const user = await this._userRepository.findOneWithRefreshToken({
      _id: decoded.userId,
      refreshToken,
      refreshTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error("Invalid or expired refresh token");
    }

    // Generate new tokens
    const tokens = this.generateTokens(user._id.toString());

    // Update refresh token in database
    await this._userRepository.update(user._id.toString(), {
      refreshToken: tokens.refreshToken,
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: tokens.accessToken,
      newRefreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token
    await this._userRepository.update(userId, {
      refreshToken: undefined,
      refreshTokenExpires: undefined,
    });
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
      refreshToken: undefined,
      refreshTokenExpires: undefined,
    });
  }

  private generateTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets are not defined");
    }

    const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
    const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";

    // Fix: Use the correct format for expiresIn
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: accessTokenExpiry as any } // Type assertion if needed
    );

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: refreshTokenExpiry as any,
    });

    return { accessToken, refreshToken };
  }
}
