const mongoose = require('mongoose')

const postschema = new mongoose.Schema({
   user :{ type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : true },

    content :{
        type : String,
        required:true,
    },
    mediaIds :[{
        type:String,
        

    }],

    createdAt  :{
        type: Date,
        default : Date.now

    }
},{timestamps :true})


postschema.index({content:'text'})

const Post = mongoose.model('Post',postschema)

module.exports= Post