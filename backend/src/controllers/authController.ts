import { Request, Response } from "express";
import { IUserService } from "../interfaces/services/IUserService.js";
import { ErrorMessages, HttpStatus, SuccessMessages } from "../constants/index.js";
import { AuthRequest } from "../types/index.js";

export class AuthController {
  private _authService: IUserService;

  constructor(authService: IUserService) {
    this._authService = authService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userName, email, phoneNumber, password } = req.body;

      const { user, accessToken, refreshToken } = await this._authService.register({
        userName,
        email,
        phoneNumber,
        password,
      });

      res.status(HttpStatus.OK).json({
        message: SuccessMessages.REGISTER_SUCCESS,
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      const status = error.message.includes(ErrorMessages.USER_ALREADY_EXISTS)
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({ error: error.message || ErrorMessages.SERVER_ERROR });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const { user, accessToken, refreshToken } = await this._authService.login(email, password);

      res.json({
        message: SuccessMessages.LOGIN_SUCCESS,
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      const status = error.message.includes(ErrorMessages.INVALID_CREDENTIALS)
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({ error: error.message || ErrorMessages.SERVER_ERROR });
    }
  };

  forgetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const { resetToken, user } = await this._authService.forgotPassword(
        email
      );

      if (process.env.NODE_ENV === "development") {
        console.log(
          "Reset link:",
          `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
        );
        res.json({ message: "Reset link logged in console (dev mode)" });
        return;
      }

      res.json({ message: SuccessMessages.PASSWORD_RESET_SENT });
    } catch (error: any) {
      console.error("Forget Password error:", error);
      const status = error.message.includes(ErrorMessages.INVALID_CREDENTIALS)
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({ error: error.message || ErrorMessages.SERVER_ERROR });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      await this._authService.resetPassword(token, password);

      res.json({ message: SuccessMessages.PASSWORD_RESET_SUCCESS });
    } catch (error: any) {
      console.error("Reset Password error:", error);
      const status = error.message.includes(ErrorMessages.INVALID_TOKEN)
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({ error: error.message || ErrorMessages.SERVER_ERROR });
    }
  };
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      const { accessToken, newRefreshToken } = await this._authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: error.message || 'Invalid refresh token' });
    }
  };

  logout = async (req: AuthRequest, res: Response): Promise<void> => { // Changed to AuthRequest
    try {
      if (!req.user?._id) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Unauthorized' });
        return;
      }

      await this._authService.logout(req.user._id.toString());
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Server error' });
    }
  };
}
