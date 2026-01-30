import express from "express";
import {
  Register,
  login,
  logoutUser,
  UpdateProfile,
  RefreshToken,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
} from "../controllers/AuthController.js";
import { validateUser } from "../validation/UserValidation.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { VerifyTokenAdmin } from "../middleware/VerifyToken.js";
import { ValidatedID } from "../middleware/validateId.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/register", validate(validateUser), Register);
router.post("/login", apiLimiter, login);
router.post("/logout", logoutUser);
router.put("/update/:id", VerifyTokenAdmin, ValidatedID, UpdateProfile);
router.post("/refresh", RefreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/reset-password", validate(validateUser), resetPassword);

export default router;




