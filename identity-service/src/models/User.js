
 const mongoose= require('mongoose')
 const argon = require('argon2')

 const userschema = new mongoose.Schema({
    username :{
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    email :{
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true  
    },
    password :{
        type : String,
        required : true,
    },
    createdat:{
        type : Date,
        default:Date.now
    }

 },{timestamps:true })


 userschema.pre('save',async function (next) {
    try {

        this.password = await argon.hash(this.password)
        next()
        
    } catch (error) {
        console.log(`password hash failed`);
    }
    
 })


 userschema.methods.comparepassword = async function (passwordtocompare) {
    try {

        return await argon.verify(this.password,passwordtocompare)
        
    } catch (error) {
        throw error
    }
 }


 userschema.index({username:'text'})

 module.exports = mongoose.model('User',userschema)