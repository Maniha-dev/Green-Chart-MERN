import User from "../models/User.js"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

//Register User: /api/user/register

export const register = async (req,res) =>{
    try{
        const { name, email, password } = req.body;

        if (!name|| !email|| !password){
            return res.json({success: false, message:"Missing details"})
        }
        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.json({success:false, message:'user already exist'})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({name, email, password: hashpassword})
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiredIn:'7d'});

        res.cookies('token',token,{
            httpOnly:true, //prevent js to access cookie
            secure: process.env.NODE_ENV === 'prodcution', // use secure cookies in production
            sameSite :process.env.NODE_ENV === 'production' ? 'none': "strict", //csrf protection
            maxAge : 7*24*60*60*1000, // coookie expiration time 
        })
        return res.json({success:true, user:{email:user.email, name:user.name}})
    } catch(error){

    }
}