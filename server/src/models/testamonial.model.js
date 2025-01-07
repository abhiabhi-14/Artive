import mongoose from "mongoose";

const testamonialSchema = mongoose.Schema({
    name:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    description:{
        type:String,
        required:true,
        min:3,
        max:200,
    },
    profilePhoto:{
        type:String,
        required:true,
    },
    dispalyed:{
        type:Boolean,
        default:false,
    }
},
    {
        timestamps:true,
    }
)

export const Member = mongoose.model("Member" , memberSchema);