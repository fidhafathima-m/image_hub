import express from "express";
const router = express.Router()
import {register, login, forgetPassword, resetPassword} from "../controllers/authController.js"

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgetPassword);
router.post('/reset-password', resetPassword);

export default router;