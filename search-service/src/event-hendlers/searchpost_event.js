const Search = require("../model/search");
const logger = require("../utils/logger");

async function searchPostHandler(event) {

    try {

        const newsearchpost  = new Search({
            postId: event.postId,
            userId: event.userId,
            content:event.content,
            createdAt:event.createdAt

        })

        await newsearchpost.save()

        logger.info(`new search post saved! PostId ${event.postId}`)
        
    } catch (error) {

        logger.error('error handling search post event ',error)
        
    }
    
}

async function deletePostHandler(event) {
    
     try {
        const postId = event.postId
       await Search.findOneAndDelete({
            postId:postId,
         
        })
      logger.info(`new search post deleted! PostId ${event.postId}`)



        
    } catch (error) {
        logger.error(`error in deleting searchpost : ${error}`)
    }
}



module.exports = {searchPostHandler,deletePostHandler}