import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  loginLimiter,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginLimiter,login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

export default router;
