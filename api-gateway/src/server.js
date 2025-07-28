require('dotenv').config()

const requiredEnvs = [
  'PORT',
  'REDIS_URL',
  'IDENTITY_SERVICE',
  'POST_SERVICE',
  'MEDIA_SERVICE',
  'SEARCH_SERVICE'
];

for (const name of requiredEnvs) {
  if (!process.env[name]) {
    console.error(`❌ ERROR: Missing environment variable ${name}`);
    process.exit(1);
  } else {
    console.log(`✅ ${name}: ${process.env[name]}`);
  }
}

const express = require('express');
const logger = require('./utils/logger');
const helmet = require('helmet')
const cors = require('cors')
const app = express()
const Redis = require('ioredis');
const {rateLimit} = require('express-rate-limit')
const {RedisStore}=require('rate-limit-redis')
const errorhandler = require('./middleware/error-handler')
const proxy = require('express-http-proxy');
const validate = require('./middleware/authmiddleware')



const PORT = process.env.PORT

const redisClient = new Redis(process.env.REDIS_URL)


app.use(helmet())
app.use(cors())
app.use(express.json())

const ratelimit = rateLimit({
    windowMs : 15*60*1000,
    max:50,
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
    logger.warn(`sensetive endpoint limit exeeded for IP: ${req.ip} `)
     res.json({
            message :'too many request '
        })
    },
    store : new RedisStore({
        sendCommand :(...args)=> redisClient.call(...args)
    })

})


app.use(ratelimit)

app.use((req,res,next)=>{
    logger.info(`recieved ${req.method} request to ${req.url}`)
    logger.info(`recieved body ${req.body} `)
    next()
})


const proxyoptions  = {
    proxyReqPathResolver : (req)=>{
        return req.originalUrl.replace(/^\/v1/,'/api')
    },

    proxyerrorhandler :(err,res,next)=>{
        logger.error('proxy error ',err.message)
         res.json({
            message:' internal server error ',
             error: err.message
         });
    }
}


app.use('/v1/auth',proxy(process.env.IDENTITY_SERVICE,{
    ...proxyoptions,
    proxyReqOptDecorator :(proxtReqOpts,srcReq)=>{
        proxtReqOpts.headers['Content-Type']= "application/json"
        return proxtReqOpts
    },

    userResDecorator:(proxyres,proxyresdata,userReq,userRes)=>{
        logger.info(`response recieved fron identity service : ${proxyres.statusCode}`)
        return proxyresdata
    }


}))

app.use('/v1/posts',validate,proxy(process.env.POST_SERVICE,{
    ...proxyoptions,
    proxyReqOptDecorator :(proxtReqOpts,srcReq)=>{
        proxtReqOpts.headers['Content-Type']= "application/json"
        proxtReqOpts.headers['x-user-id']= srcReq.user.userId 
        if (!srcReq.user || !srcReq.user.userId) {
           throw new Error('Missing user info in proxy');
          }


        return proxtReqOpts
    },

    userResDecorator:(proxyres,proxyresdata,userReq,userRes)=>{
        logger.info(`response recieved fron post service : ${proxyres.statusCode}`)
        return proxyresdata
    }


}))


app.use('/v1/media',validate,proxy(process.env.MEDIA_SERVICE,{
    ...proxyoptions,
    proxyReqOptDecorator :(proxtReqOpts,srcReq)=>{
        proxtReqOpts.headers['x-user-id']= srcReq.user.userId 
        if (!srcReq.headers['content-type'].startsWith('multipart/form-data')) {
          proxtReqOpts.headers['Content-Type']= "application/json"
          }


        return proxtReqOpts
    },

    userResDecorator:(proxyres,proxyresdata,userReq,userRes)=>{
        logger.info(`response recieved fron media service : ${proxyres.statusCode}`)
        return proxyresdata
    },

    parseReqBody:false

}))

app.use('/v1/search',validate,proxy(process.env.SEARCH_SERVICE,{
    ...proxyoptions,
    proxyReqOptDecorator :(proxtReqOpts,srcReq)=>{
        proxtReqOpts.headers['x-user-id']= srcReq.user.userId 
        if (!srcReq.headers['content-type'].startsWith('multipart/form-data')) {
          proxtReqOpts.headers['Content-Type']= "application/json"
          }


        return proxtReqOpts
    },

    userResDecorator:(proxyres,proxyresdata,userReq,userRes)=>{
        logger.info(`response recieved fron search service : ${proxyres.statusCode}`)
        return proxyresdata
    },

    parseReqBody:false

}))





app.use(errorhandler);

app.listen(PORT, () => {
 logger.info(`api gateway server running on port ${PORT}`);
logger.info(`identity service target: ${process.env.IDENTITY_SERVICE}`);
logger.info(`post service target: ${process.env.POST_SERVICE}`);
logger.info(`media service target: ${process.env.MEDIA_SERVICE}`);
logger.info(`search service target: ${process.env.SEARCH_SERVICE}`);


});