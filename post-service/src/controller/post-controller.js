const Post = require('../model/post')
const logger = require('../utils/logger')
const {validationregistration} = require('../utils/validation')
const {publishevent}=require('../utils/rebbitmq')

const invalidpostcache = async(req,input)=>{

    const cachedkey = `Post:${input}`
    await req.redisClient.del(cachedkey)
    const keys = await req.redisClient.keys(`Post:*`)
    if(keys.length>0){
        await req.redisClient.del(keys)
    }

}

const createpost = async(req ,res)=>{
        logger.info('creatpost end point')
    try {
        const {error} =  validationregistration(req.body)  
        if(error){
            logger.warn('validation error ',error.details[0].message)
             res.json({
                success : false,
                message : error.details[0].message
             });
        
            }
        const {content,mediaIds}= req.body

        const newPost = new Post({
            user:req.user.userId,
            content:content,
            mediaIds:mediaIds||[]

        })
        await newPost.save()

           publishevent('post.created', {
           postId: newPost._id.toString(),
            userId: newPost.user.toString(),
            content:newPost.content,
            createdAt:newPost.createdAt
           });


        await invalidpostcache(req,newPost._id.toString())
        
        logger.info('post created successfull',newPost)
        res.status(200).json({
            success : true,
            message :" post created successfull"
        });

        
    } catch (error) {
        logger.error(`error in create post : ${error}`)
        res.json({
            success:false,
            message : "error in create post"
        })
    }
}


const getallpost = async(req ,res)=>{
   logger.info('getallpost end point')

    try {
        const  page = parseInt(req.query.page)||1
        const limit = parseInt(req.query.limit)||10
        const startindex =( page-1)*limit

        const cachekey =`Post:${page}:${limit}`
        const cachedposts =await  req.redisClient.get(cachekey)

        if(cachedposts){
            return res.json(JSON.parse(cachedposts))
        }

        const posts = await Post.find({}).
        sort({createdAt:-1}).
        skip(startindex).
        limit(limit)

            const total = await Post.countDocuments()

            const result = {
                posts,
                currentpage :page,
                totalPages : Math.ceil(total / limit),
                totalposts : total
            }

            await req.redisClient.setex(cachekey,300,JSON.stringify(result))

            res.json(result)


        
    } catch (error) {
        logger.error(`error in fetching post : ${error}`)
        res.json({
            success:false,
            message : "error in create post"
        })
    }
}



const getpost = async(req ,res)=>{
    try {

        const postId =  req.params.id
        const cacheKey= `Post:${postId}`
        const cachedpost = await req.redisClient.get(cacheKey)
        
        if(cachedpost){
           return res.json(JSON.parse(cachedpost))
        }

        const singlePost = await Post.findById(postId)
        if(!singlePost){
            return res.json({
                success : false,
                message : 'post doesn`t exist'
            })}
       
       await req.redisClient.setEx(cacheKey, 3600, JSON.stringify(singlePost)); 


            res.json({
                singlePost
            })
        
    } catch (error) {
        logger.error(`error in fetching post : ${error}`)
        res.json({
            success:false,
            message : "error in create post"
        })
    }
}


const deletepost = async(req ,res)=>{
    try {
        const postId = req.params.id
        const post = await Post.findByIdAndDelete({
            _id:postId,
           user: req.user.userId
        })
            if(!post){
            return res.json({
                success : false,
                message : 'post doesn`t exist'
            })}

         publishevent('post.deleted', {
           postId: post._id.toString(),
            userId: post.user.toString(),
            mediaIds: post.mediaIds
           });




          await invalidpostcache(req,req.params.id)
          res.status(200).json({
            success : true,
            message :" post deleted successfull"
        });


        
    } catch (error) {
        logger.error(`error in deleting post : ${error}`)
        res.json({
            success:false,
            message : "error in delete post"
        })
    }
}

module.exports= {createpost,getallpost,getpost,deletepost}