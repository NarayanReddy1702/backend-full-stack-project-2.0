import mongoose, { Schema, model } from "mongoose";

const videoSchema = new Schema(
    {
        videoFile: {
            type:String,
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        },
        title:{
            type:String,
            required:true
        },
         description:{
            type:String,
            required:true
        }, 
        duration:{
            type:Number,
            required:true
        },
        view:{
            type:String
        },
        isPublised:{
            type:Boolean,
            default:true
        }
    }
);

export const Video = model("Video", videoSchema);
