import express from "express"
import { authenticateJWT } from "../middlewares/authMiddleware"
import { protectedDashboard } from "../controllers/authController"
import { authorizeRole } from "../middlewares/roleMiddleware";


 const router = express.Router()


 router.get("/dashboard",authenticateJWT,protectedDashboard);
router.get("/admin",authenticateJWT,authorizeRole(["admin"]),(req,res)=>{
    res.json({ message: "Welcome, Admin!" })
})
router.get("/teacher",authenticateJWT,authorizeRole(["teacher"]),(req,res)=>{
    res.json({ message: "Welcome, teacher!" })
})


export default router