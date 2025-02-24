import express from "express";
import { register,login, authenticateJWT, ProtectedDashboard
 } from "../controllers/studentAuthController";

 const router  = express.Router()


router.post("/register",register)
router.post("/login",login)
router.get("/dashboard",authenticateJWT,ProtectedDashboard)

export default router