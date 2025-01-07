import mongoose from 'mongoose';
import bycrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            match:[/.+@iiitkota.ac.in/,'Please enter a valid email address']
        },
        password:{
            type:String,
            required:[true,"Password is required"],
        },
        role:{
            type:String,
            enum:['user','admin'],
            default:'user'
        },
        refreshToken:{
            type:String,
            default:null
        }
    },
    {
        timestamps:true,
    }
)

userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next();
    
    this.password = await bycrypt.hash(this.password,10)
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bycrypt.compare(password,this.password);   
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY || '30m',
        }
    );  
};

userSchema.methods.generateRefreshToken = async function (){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY || '7d',
        }
    );
};

export const User = mongoose.model("User" , userSchema);