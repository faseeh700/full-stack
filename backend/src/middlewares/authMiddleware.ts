import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../db/pool";
import { AuthenticatedRequest } from "../../types";

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction):Promise<void> => {
  const token = req.header("Authorization");

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return
  }

  try {
    // 1️⃣ Verify and decode the JWT token
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET!) as { userId: number; email: string };
console.log("decoded",decoded)
    // 2️⃣ Initialize req.user with user ID and email
    req.user = { userId: decoded.userId, email: decoded.email, roles: [] };

    // 3️⃣ Fetch user roles from the database
    const rolesQuery = await pool.query(
      `SELECT r.name FROM roles r 
       JOIN user_roles ur ON r.id = ur.role_id 
       WHERE ur.user_id = $1`, 
      [decoded.userId]
    );

    // 4️⃣ Attach roles to req.user
    req.user.roles = rolesQuery.rows.map((row) => row.name);

    next(); // Proceed to the next middleware or route
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
    return
  }
};
