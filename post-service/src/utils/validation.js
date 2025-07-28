const joi = require('joi')

const validationregistration = (data)=>{
    const Schema = joi.object({
        content : joi.string().min(3).max(5000).trim().required(),
        mediaIds:joi.array()
      
    })

    return Schema.validate(data)
}


module.exports ={ validationregistration }