 const mongoose = require('mongoose')

 const refreshschema = new mongoose.Schema({
    token:{
        type : String,
        required : true,
        unique : true
    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    expireAt :{
        type : Date,
        required : true

    }
 },{timestamps:true})

 refreshschema.index({expireAt:1},{expireAfterSeconds:0})

 const Refreshtoken = mongoose.model('Refreshtoken', refreshschema);
module.exports = Refreshtoken;