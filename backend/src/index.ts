
import express from "express"
import pool from "./db"
const PORT = 4000



const app = express()
app.use(express.json())






app.get("/test-db",async(req,res)=>{

    try {
        const result = await pool.query(`SELECT * FROM students`)
        res.json(result)
    } catch (error) {
        res.status(500).json({error:(error as Error).message})
    }
})


app.post("/users",async(req,res)=>{

    try {
        const { first_name, last_name, date_of_birth, email, enrollment_date, major, gpa } = req.body;
        
        const insertUsers = await pool.query(`INSERT INTO students(first_name, last_name, date_of_birth, email, enrollment_date, major, gpa) 
            VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, first_name, last_name`, //returning use for what we insert it will return in the result
            [first_name, last_name, date_of_birth, email, enrollment_date, major, gpa]
            );
            res.status(201).json(insertUsers)
    } catch (error) {
        console.error(error); // Log error to troubleshoot
        res.status(500).json({ error: error });
    }
})
  





app.listen(PORT,()=>{
    console.log(`server is running on ports ${PORT}`)
})