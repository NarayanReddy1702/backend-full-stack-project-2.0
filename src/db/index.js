import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

 const coonectDB =async ()=>{
    try {
       const mongooseConnection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\n MongoDB connected !! DB HOST: ${mongooseConnection.connection.host}`);
       
    } catch (error) {
        console.log("MongoDB Connection Failed :",error);
        process.exit(1)
    }
}

export default coonectDB