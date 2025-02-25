// src/app.ts
import express from "express";
import studentRoutes from "./routes/studentRoutes";
import { initDB } from "./db/pool";
import authRoutes from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// create new Tables from here
// initDB()


// Routes
app.use("/api", studentRoutes);
app.use("/auth", authRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
