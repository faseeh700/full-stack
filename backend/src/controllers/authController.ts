import { Request, Response } from "express";
import pool from "../db/pool";
import { hashPassword, generateToken } from "../auth/authUtills";
import { AuthenticatedRequest } from "../../types";
import bcrypt from "bcryptjs";

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

    res.json({ user: { email: user.rows[0].email, id: user.rows[0].id }, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
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
