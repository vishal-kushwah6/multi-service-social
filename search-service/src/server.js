require('dotenv').config()
const express = require('express');
const  mongoose  = require('mongoose');
const logger = require('./utils/logger');
const helmet = require('helmet')
const cors = require('cors')
const errorhandler = require('./middleware/errorhandler');
const {connectRabbitmq,consumeEvents}= require('./utils/rebbitmq');
const  router = require('./routes/searchroutes');
const {searchPostHandler,deletePostHandler} = require('./event-hendlers/searchpost_event')



 
const app = express()

const PORT = process.env.PORT

mongoose.connect(process.env.MONGO_URL).then(()=>{
    logger.info('db is connected')
}).catch(e=>{
    logger.error('db is not connected',e)
})

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req,res,next)=>{
    logger.info(`recieved ${req.method} request to ${req.url}`)
    logger.info(`recieved body ${req.body} `)
    next()
})



app.use('/api/search',router)





app.use(errorhandler)


async function startserver() {
    try {
        await connectRabbitmq()
        await consumeEvents('post.created',searchPostHandler)
        await consumeEvents('post.deleted',deletePostHandler)


    app.listen(PORT,()=>{
    logger.info(`server is running on port ${PORT}`)
    })
        
    } catch (error) {

        logger.error('server connection failed!',error)
        
    }
    
}

startserver()


process.on('unhandledRejection',(reason,promise)=>{
    logger.error('unhandeled rejection at ',promise,'reason ',reason)
})


 