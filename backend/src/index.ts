// src/app.ts
import express from "express";
import studentRoutes from "./routes/studentRoutes";
import { initDB } from "./db/pool";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// create new Tables from here
// initDB()


// Routes
app.use("/api", studentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
