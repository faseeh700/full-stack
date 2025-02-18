// src/controllers/studentController.ts
import { Request, Response } from "express";
import pool from "../db/pool";
import { handleError } from "../utils/errorHandler";

// 🟢 1. Get All Students
export const getAllStudents = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM students");
    res.json({ students: rows });
  } catch (error) {
    handleError(res, error);
  }
};

// 🟢 2. Create a New Student
export const createStudent = async (req: Request, res: Response) => {
  const { first_name, last_name, date_of_birth, email, enrollment_date, major, gpa } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO students (first_name, last_name, date_of_birth, email, enrollment_date, major, gpa)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, first_name, last_name`,
      [first_name, last_name, date_of_birth, email, enrollment_date, major, gpa]
    );

    res.status(201).json({
      message: "Student inserted successfully",
      student: rows[0],
    });
  } catch (error) {
    handleError(res, error);
  }
};

// 🟢 3. Update Student Major
export const updateStudentMajor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { major } = req.body;

  try {
    const { rowCount, rows } = await pool.query(
      `UPDATE students SET major = $1 WHERE id = $2 RETURNING *`,
      [major, id]
    );

    if (rowCount === 0) {
        res.status(404).json({ error: "User not found" });
        return 
    }

    res.json({
      message: "Major updated successfully",
      updatedStudent: rows[0],
    });
  } catch (error) {
    handleError(res, error);
  }
};

// 🟢 4. Delete Student by ID
export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { rowCount, rows } = await pool.query(
      `DELETE FROM students WHERE id = $1 RETURNING *`,
      [id]
    );

    if (rowCount === 0) {
        res.status(404).json({ error: "User not found" });
        return 
    }

    res.json({
      message: "Student deleted successfully",
      deletedStudent: rows[0],
    });
  } catch (error) {
    handleError(res, error);
  }
};
