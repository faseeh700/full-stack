import { Request, Response } from "express";
import pool from "../db/pool";
import {
  hashPassword,
  generateToken,
  generateRefreshToken,
} from "../auth/authUtills";
import { AuthenticatedRequest } from "../../types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🟢 Register User
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    // Hash password and save user
    const hashedPassword = await hashPassword(password);
    const newUser = await pool.query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username",
      [email, hashedPassword, username],
    );

    res.status(201).json({ user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// 🟢 Login User
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const accessToken = generateToken(user.rows[0].id);
    const refreshToken = generateRefreshToken(user.rows[0].id);

    const { rowCount } = await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [user.rows[0].id, refreshToken],
    );
    console.log(rowCount);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.json({ message: "login successfully", accessToken });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    console.log("refresh cookies", req.cookies);
    const refreshToken = req.cookies.refreshToken; // ✅ Read from cookies
    if (!refreshToken) return res.status(401).json({ error: "Unauthorized" });

    const tokenCheck = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [refreshToken],
    );
    if (tokenCheck.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET!,
      async (err: any, decoded: any) => {
        if (err)
          return res.status(403).json({ message: "Invalid refresh token" });
        const userId = decoded.userId;
        const newAccessToken = generateToken(userId);
        const newRefreshToken = generateRefreshToken(userId);
        // 2️⃣ Check if refresh token exists in the database

        await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
          refreshToken,
        ]);

        await pool.query(
          "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
          [userId, newRefreshToken],
        );

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });

        res.json({
          accessToken: newAccessToken,
        });
      },
    );
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(403).json({ error: "Invalid token" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Received Cookies in Logout:", req.cookies); // 🔥 Debugging
    const refreshToken = req.cookies.refreshToken; // ✅ Read from cookies;
    if (!refreshToken) {
      res.status(204).send(); // No Content
      return;
    }

    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken,
    ]);

    res.clearCookie("refreshToken");

    // 3️⃣ Send success response
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};

// 🛡️ Protected Route
export const protectedDashboard = (
  req: AuthenticatedRequest,
  res: Response,
): void => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized access" });
    return;
  }
  res.json({ message: `Welcome ${req.user.email}!`, user: req.user });
};
