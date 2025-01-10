import mongoose from "mongoose";
import { Likes } from "./likes.model.js";

const photoSchema = mongoose.Schema(
    {
        imgUrl:{
            type:String,
            required:true
        },
        author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        content:{
            type:String,
            trim:true,
        },
        displayed:{
            type:Boolean,
            default:false,
        }
    },
    {
        timestamps:true//contains createdAt--is set once the document is first saved and updateAt-- isset each time document is modified ans saved
    }
)

photoSchema.pre('deleteOne',{document:true,query:false},async function (next) {
    try{
        await Likes.deleteMany({
            $or:[
                {photo:this._id}
            ]
        });
        next();
    }
    catch(err){
        next(err);
    }
    
})

export const Photo = mongoose.model("Photo" , photoSchema);
