import { Request, Response } from "express";
import pool from "../db/pool";
export const registerStudents = async(req:Request,res:Response) =>{
    try {
    const{email,password,username} = req.body
    const userCheck = await pool.query(`SELECT * FROM users WHERE email = $1`,[email])

    if(userCheck.rows.length > 0){
        res.status(400).json({error:"user already exists"})
    }

    // const result = await pool.query(`
    //     INSERT users (email,password,username) VALUES ($2,$3,$3) RETURNING email
    //     `,[email,password,username])
    
} catch (error) {
    res.status(500).json((error as Error).message)
}
}