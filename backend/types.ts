import { Request } from "express";

// ✅ Allow `email` and `username` to be optional
export interface AuthenticatedRequest extends Request {
  user?: { userId: number; email?: string; username?: string,roles:string[] };
}
