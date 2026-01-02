import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { IUserService } from "../interfaces/services/IUserService";

export class AuthController {
  private authService: IUserService;

  constructor(authService: IUserService) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userName, email, phoneNumber, password } = req.body;

      const { user, token } = await this.authService.register({
        userName,
        email,
        phoneNumber,
        password,
      });

      res.status(200).json({
        message: "User registered successfully!",
        token,
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      const status = error.message.includes("already exists") ? 400 : 500;
      res.status(status).json({ error: error.message || "Server error" });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const { user, token } = await this.authService.login(email, password);

      res.json({
        message: "Logged In successfully!",
        token,
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      const status = error.message.includes("Invalid credentials") ? 400 : 500;
      res.status(status).json({ error: error.message || "Server error" });
    }
  };

  forgetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const { resetToken, user } = await this.authService.forgotPassword(email);

      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔗 Reset link:",
          `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
        );
        res.json({ message: "Reset link logged in console (dev mode)" });
        return;
      }

      res.json({ message: "Password reset mail sent" });
    } catch (error: any) {
      console.error("Forget Password error:", error);
      const status = error.message.includes("Invalid credentials") ? 400 : 500;
      res.status(status).json({ error: error.message || "Server error" });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      await this.authService.resetPassword(token, password);

      res.json({ message: "Password reset successful!" });
    } catch (error: any) {
      console.error("Reset Password error:", error);
      const status = error.message.includes("Invalid or expired token")
        ? 400
        : 500;
      res.status(status).json({ error: error.message || "Server error" });
    }
  };
}
