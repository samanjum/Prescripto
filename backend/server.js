import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectcloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRooute.js'
import userRouter from './routes/userRoutes.js'

// app  config

const app = express()
connectcloudinary();
const port = process.env.PORT || 4000
connectDB()
// connectcloudinary()
//middleware
app.use(express.json())
app.use(cors())

//api end points
app.use('/api/admin',adminRouter)
//localhost:4000/api/admin 

app.use('/api/doctors',doctorRouter)

app.use('/api/user',userRouter)

app.get('/',(req,res)=>{
res.send('API working greatly ')
} )

app.listen(port,()=>console.log("server started",port))