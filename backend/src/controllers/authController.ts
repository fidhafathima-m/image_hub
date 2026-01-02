import { Request, Response } from "express";
import { IUserService } from "../interfaces/services/IUserService";
import { ErrorMessages, HttpStatus, SuccessMessages } from "../constants";

export class AuthController {
  private _authService: IUserService;

  constructor(authService: IUserService) {
    this._authService = authService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userName, email, phoneNumber, password } = req.body;

      const { user, token } = await this._authService.register({
        userName,
        email,
        phoneNumber,
        password,
      });

      res.status(HttpStatus.OK).json({
        message: SuccessMessages.REGISTER_SUCCESS,
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
      const status = error.message.includes(ErrorMessages.USER_ALREADY_EXISTS)
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({ error: error.message || ErrorMessages.SERVER_ERROR });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const { user, token } = await this._authService.login(email, password);

      res.json({
        message: SuccessMessages.LOGIN_SUCCESS,
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
}
