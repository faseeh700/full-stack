import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../types";

export const authorizeRole = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction):void => {
    if (!req.user || !req.user.roles.length) {
        res.status(403).json({ error: "Access denied. No roles assigned." });
        return 
    }

    const hasRole = req.user.roles.some((role) => requiredRoles.includes(role));
    if (!hasRole) {
     res.status(403).json({ error: "Access denied. Insufficient permissions." });
     return
    }

    next();
  };
};
