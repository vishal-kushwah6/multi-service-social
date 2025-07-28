
const logger = require('../utils/logger')
const Search = require('../model/search')

const searchPost = async (req,res)=>{
    logger.info('search endpoint hit!')
    try {

        const {query} = req.query
const result = await Search.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } } // case-sensitive: "textScore", not "textscore"
)
.sort({ score: { $meta: "textScore" } })
.limit(10);


        res.json({
            success : true,
            result : result
        })



        
    } catch (error) {
        logger.error('error while search media,:', error);
        return res.status(500).json({
            success: false,
            message: "error while search media"
        });
        
    }}


    module.exports = {searchPost}