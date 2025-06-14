import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json({limit:"16kb"}))
app.use(cookieParser())
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))




// routers import 
import registerUser from "./routers/user.router.js"

//routers decleration 
app.use("/api/v1/users",registerUser)

// export default app
export {app}