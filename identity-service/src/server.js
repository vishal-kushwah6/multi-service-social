require('dotenv').config()
const express = require('express');
const  mongoose  = require('mongoose');
const logger = require('./utils/logger');
const helmet = require('helmet')
const cors = require('cors')
const app = express()
const {RateLimiterRedis} = require('rate-limiter-flexible')
const redis = require('ioredis');
const { log } = require('winston');
const {rateLimit} = require('express-rate-limit')
const {RedisStore}=require('rate-limit-redis')
const router = require('./routes/identity-service');
const errorhandler = require('./middleware/errorhandler');



const PORT = process.env.PORT





mongoose.connect(process.env.Mongo_Uri).then(()=>{
    logger.info('db is connected')
}).catch(e=>{
    logger.error('db is not connected',e)
})

const redisClient = new redis(process.env.Redis_Url)
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req,res,next)=>{
    logger.info(`recieved ${req.method} request to ${req.url}`)
    logger.info(`recieved body ${req.body} `)
    next()
})


const ratelimiter = new RateLimiterRedis({
    storeClient : redisClient,
    keyPrefix:'middleware',
    points:10,
    duration:3
})

app.use((req,res,next)=>{
    ratelimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn('rate limit exeeded')

        res.json({
            message :'too many request '
        })
    })
})


const sensetiveratelimit = rateLimit({
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

app.use('/api/auth/register',sensetiveratelimit)

app.use('/api/auth', router) 

app.use(errorhandler)


app.listen(PORT,()=>{
    logger.info(`server is running on port ${PORT}`)
})


process.on('unhandledRejection',(reason,promise)=>{
    logger.error('unhandeled rejection at ',promise,'reason ',reason)
})