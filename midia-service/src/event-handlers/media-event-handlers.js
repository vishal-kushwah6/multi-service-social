const Media =  require('../model/media')
const {deleteMedia} =require('../utils/cloudinary')
const logger = require('../utils/logger')

async function handleDeleteEvent(event){

    const {postId,mediaIds} = event

    try {
        const mediatoDelete = await  Media.find({_id:{$in : mediaIds}})
        
        for(const media of mediatoDelete){
            await deleteMedia(media.publicId)
            await Media.findByIdAndDelete(media._id)

            logger.info(`deletes media ${media._id} associated with this deleted post ${postId}`)


        }
    } catch (error) {

       logger.error('error while deleting media ')
        
        
    }
    

}

module.exports = {handleDeleteEvent}