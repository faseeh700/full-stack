import { Response } from "express";

export const handleError = (res: Response, error: unknown, status = 500) => {
  const errorMessage = (error as Error).message || "An unknown error occurred";
  console.error(`❌ Error: ${errorMessage}`);
  res.status(status).json({ error: errorMessage });
};