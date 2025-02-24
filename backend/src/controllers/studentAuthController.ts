import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/pool";
import { AuthenticatedRequest } from "../../types";

// 🔑 Helper: Hash passwords
const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 🔑 Helper: Create JWT token
const generateToken = (userId: number,username:string,email:string) => {
  return jwt.sign({ userId,username,email }, process.env.JWT_SECRET!, { expiresIn: "1h" });
};


export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction):void => {
  // 1️⃣ Get token from request headers
  const token = req.header("Authorization");

  // 2️⃣ If no token, deny access
  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return 
  }

  try {
    // 3️⃣ Verify token
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET!) as {
      userId: number;
      email?: string;
      username?: string;
    };

    // 4️⃣ Attach user data to request object
    req.user = decoded;

    // 5️⃣ Continue to the next middleware/route
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};





// 🟢 Register
export const register = async (req: Request, res: Response):Promise<void> => {
  try {
    const { email, password,username } = req.body;

    // 1. Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows[0] > 0) {
      res.status(400).json({ error: "Email already exists" });
      return 
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(password);

    // 3. Save user to DB
    const newUser = await pool.query(
      "INSERT INTO users (email, password,username) VALUES ($1, $2,$3) RETURNING id, email,username",
      [email, hashedPassword,username]
    );

    // 4. Generate token
    

    res.status(201).json({ user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// 🟢 Login
export const login = async (req: Request, res: Response):Promise<void> => {
  try {
    const { email, password } = req.body;
   

    // 1. Find user
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      res.status(400).json({ error: "Invalid email or password" });
      return
    }

    // 2. Compare passwords
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!validPassword) {
      res.status(400).json({ error: "Invalid email or password" });
      return
    }

    
    // 3. Generate token
    const token = generateToken(user.rows[0].id,user.rows[0].username,user.rows[0].email);
  

    res.json({ user:{email: user.rows[0].email,id:user.rows[0].id}, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};



export const ProtectedDashboard = (req: AuthenticatedRequest, res: Response):void => {
  console.log(req.user)
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized access" });
    return 
  }
  res.json({ message: `Welcome ${req.user.email}!`, user: req.user });
};




