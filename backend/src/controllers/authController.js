import User from "../models/UserSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypo from "crypto"
import nodemailer from "nodemailer"

// Register User
export const register = async(req, res) => {
    try {
        const {userName, email, phoneNumber, password} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({error: "User already exists, please login."});
        }

        const salt = await bcrypt.getSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // create user
        const user = new User({
            userName,
            email,
            phoneNumber,
            hashPassword
        })
        await user.save()

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})

        res.status(200).json({
            message: "User registered successfully!",
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        })

    } catch (error) {
        console.error("Registration error: ", error);
        res.status(500).json({error: "Server error"})
    }
}

// login
export const login = async(req, res) => {
    try {
        const {email, password} = req.body;

        // find user
        const user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({error: "Invalid credentials"});
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({error: "Invalid credentials"})
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})

        res.json({
            message: "Logged In successfully!",
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        })

    } catch (error) {
        console.error("Login error: ", error);
        res.status(500).json({error: "Server error"})
    }
}

// forgot password
export const forgetPassword = async(req, res) => {
    try {
        const {email} = req.body;

        // find user
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({error: "Invalid credentials"});
        }

        // generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() * 3600000   // 1 h

        user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // create reset url
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Password Reset Request",
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        }

        await transporter.sendMail(mailOptions);

        res.json({message: "Password reset mail sent"});
    } catch (error) {
        console.error("Forget Password error: ", error);
        res.status(500).json({error: "Server error"})
    }
}

// reset password 
export const resetPassword = async(req, res) => {
    try {
        const {token, password} = req.body;

        // hash token
        const hashToken = crypo
        .createHash("sh256")
        .update(token)
        .digest("hex")

        // find user
        const user = await User.findOne({
            resetPasswordToken: hashToken,
            resetPasswordExpires: {$gt: Date.now()}
        })

        if(!user) {
            return res.status(400).json({error: "Invalid or expired token"})
        }

        // hash new password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        // update password 
        user.password = hashPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({message: "Password reset successful!"})
    } catch (error) {
        console.error("Reset Password error: ", error);
        res.status(500).json({error: "Server error"})
    }
}