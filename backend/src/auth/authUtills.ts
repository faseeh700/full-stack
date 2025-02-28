import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔑 Hash passwords
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 🔑 Generate JWT token
export const generateToken = (userId: number, username: string, email: string) => {
  return jwt.sign({ userId, username, email }, process.env.JWT_SECRET!, { expiresIn: "1m" });
};



export const generateRefreshToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "2m" });
};
