import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name:{ type: string, required: true},
    email:{ type: string, required: true, unique:true},
    password:{ type: string, required: true},
    cartItems:{ type: object, default:{}}
}, {minimize: false})

const User = mongoose.models.user || mongoose.model('user', userSchema)

export default User