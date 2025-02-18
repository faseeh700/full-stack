// src/routes/studentRoutes.ts
import express from "express";
import {
  getAllStudents,
  createStudent,
  updateStudentMajor,
  deleteStudent,
} from "../controllers/studentController";


const router = express.Router();

router.get("/students", getAllStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudentMajor);
router.delete("/students/:id", deleteStudent);





export default router;
