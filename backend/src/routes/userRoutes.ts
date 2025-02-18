import express from "express";
import { registerStudents } from "../controllers/studentAuthController";

const router  = express.Router()


router.post("/register",registerStudents)