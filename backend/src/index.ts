
import express from "express"
const PORT = 5000



const app = express()



app.use("",(req,res)=>{
res.send("users")
})


app.listen(PORT,()=>{
    console.log(`server is running on ports ${PORT}`)
})