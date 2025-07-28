const joi = require('joi')

const validationregistration = (data)=>{
    const Schema = joi.object({
        username : joi.string().min(3).max(50).trim().required(),
        email : joi.string().email().trim().required(),
        password : joi.string().min(6).trim().required()
    })

    return Schema.validate(data)
}

const validationlogin = (data)=>{
    const Schema = joi.object({
        email : joi.string().email().trim().required(),
        password : joi.string().min(6).trim().required()
    })

    return Schema.validate(data)
}


module.exports ={ validationregistration ,validationlogin}