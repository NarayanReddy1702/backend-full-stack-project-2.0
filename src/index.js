// import mongoose from "mongoose"
// import { DB_NAME } from "./constants";

import coonectDB from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
   path:"./env"
})


coonectDB()







/*
//first one
import express from "express"
const app = express()
const port = process.env.PORT
(async ()=>{
   try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on(error,(error)=>{
        console.log("Error:",error);
         throw error
       })
       app.listen(port,()=>{
        console.log(`the app is runing on port ${port}`);
       })
   } catch (error) {
      console.error("Error:",error);
      throw error
   }
})()

*/