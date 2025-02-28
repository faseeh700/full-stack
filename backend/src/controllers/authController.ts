import { Request, Response } from "express";
import pool from "../db/pool";
import { hashPassword, generateToken,generateRefreshToken } from "../auth/authUtills";
import { AuthenticatedRequest } from "../../types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

// 🟢 Register User
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    // Hash password and save user
    const hashedPassword = await hashPassword(password);
    const newUser = await pool.query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username",
      [email, hashedPassword, username]
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
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
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
    const token = generateToken(user.rows[0].id, user.rows[0].username, user.rows[0].email);
    const refreshToken = generateRefreshToken(user.rows[0].id)

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [user.rows[0].id, refreshToken]
    );

    res.json({message:"login successfully", token,refreshToken });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};




export const refreshToken = async (req: Request, res: Response):Promise<any> => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    // Check if token exists in database
    const result = await pool.query("SELECT * FROM refresh_tokens WHERE token = $1", [token]);

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(403).json({ error: "Invalid token" });
  }
};




// 🛡️ Protected Route
export const protectedDashboard = (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized access" });
    return;
  }
  res.json({ message: `Welcome ${req.user.email}!`, user: req.user });
};





