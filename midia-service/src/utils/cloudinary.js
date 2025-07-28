const cloudinary = require('cloudinary').v2
const logger = require('../utils/logger')

cloudinary.config({
    cloud_name:process.env.cloud_name,
    api_key:process.env.api_key,
    api_secret:process.env.api_secret,
})


const uploadMediaToCloudinary = (file)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type : 'auto'
             },(error,result)=>{
                if(error){
                    logger.error('error while uploading media to cloudinary',error)
                    reject(error)
                }else{
                    resolve(result)
                }
            } )

            uploadStream.end(file.buffer)

})
}

const deleteMedia = async (publicId)=>{
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        logger.info('media deleted successfuly, publicID: ',publicId)
        
    } catch (error) {
        logger.error('error while deleting media to cloudinary',error)
    }
}


module.exports = {uploadMediaToCloudinary,deleteMedia}