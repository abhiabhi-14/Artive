import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
        min:3,
        max:500,
    },
    rules:{
        type:String,
        required:true,
        min:3,
        max:500,
    },
    teamSize:{
        type:Number,
        required:true,
        default:3,
    },
    venue:{
        type:String,
        required:true,
    },
    dateOfEvent:{
        type:Date,
        required:true,
    },
    photos:{
        type:[String]
    }
},
    {
        timestamps:true,
    }
)

eventSchema.pre('deleteOne',{document:true,query:false},async function (next) {
    try{
        await Likes.deleteMany({
            $or:[
                {event:this._id}
            ]
        });
        next();
    }
    catch(err){
        next(err);
    }
    
})
export const Event = mongoose.model("Event" , eventSchema);