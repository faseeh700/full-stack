import express from "express";
import { register,login,protectedDashboard
 } from "../auth/authController";
import { authenticateJWT } from "../auth/authMiddleware";

 const router  = express.Router()


router.post("/register",register)
router.post("/login",login)
router.get("/dashboard",authenticateJWT,protectedDashboard)

export default router