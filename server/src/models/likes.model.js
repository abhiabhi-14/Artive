import mongoose from "mongoose";

const likesSchema = mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        exent:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Event",
        },
        photo:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Photo",
        }
    },
    {
        timestamps:true,
    }
) 

export const Likes = mongoose.model("Likes" , likesSchema);