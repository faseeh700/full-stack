
import express from "express"
import pool from "./db"
const PORT = 4000



const app = express()
app.use(express.json())






app.get("/test-db",async(req,res)=>{

    try {
        const result = await pool.query(`SELECT * FROM students`)
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({error:(error as Error).message})
    }
})


app.post("/users",async(req,res)=>{

    try {
        const { first_name, last_name, date_of_birth, email, enrollment_date, major, gpa } = req.body;
        
        const insertUsers = await pool.query(`INSERT INTO students(first_name, last_name, date_of_birth, email, enrollment_date, major, gpa) 
            VALUES($1, $2, $3, $4, $5, $6, $7)`, //returning use for what we insert it will return in the result
            [first_name, last_name, date_of_birth, email, enrollment_date, major, gpa]
            );
            res.status(201).json(insertUsers.rows)
    } catch (error) {
        console.error(error); // Log error to troubleshoot
        res.status(500).json({ error: error });
    }
})


app.put("/users/:id",async(req,res)=>{
    const{id} = req.params
    const{major} = req.body
    try {
        const updateData = await pool.query(`UPDATED students SET major = $1 WHERE id = $2 RETURNING`,[major,id]

            
        )
        if(updateData.rowCount === 0){
            return res.status(400).json("user dont exist")
        }
        res.status(200).json(updateData.rowCount)


    } catch (error) {
        res.status(500).json(error)
    }
})

  





app.listen(PORT,()=>{
    console.log(`server is running on ports ${PORT}`)
})