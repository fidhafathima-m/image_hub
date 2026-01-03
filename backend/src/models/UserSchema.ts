import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// Interface for User document
export interface IUser extends Document {
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshToken: string;
  refreshTokenExpires: Date;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface for User model (static methods)
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  // Add more static methods as needed
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid email address!`,
      },
      index: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v: string) {
          return /^[0-9]{10,15}$/.test(v);
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid phone number!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for user's full name (if needed)
userSchema.virtual("fullName").get(function (this: IUser) {
  return this.userName;
});

// Hash password before saving
userSchema.pre<IUser>("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Static method: Find user by email
userSchema.statics.findByEmail = async function (
  email: string
): Promise<IUser | null> {
  return await this.findOne({ email }).select("+password");
};

// Static method: Check if email exists
userSchema.statics.emailExists = async function (
  email: string
): Promise<boolean> {
  const user = await this.findOne({ email });
  return !!user;
};

// Add after your existing pre('save') hook:
userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as any;

  // Check if password is being updated
  if (update && update.password) {
    try {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
    } catch (error: any) {
      return error;
    }
  }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model<IUser, IUserModel>("User", userSchema);
export default User;
