require('dotenv').config()
const express = require('express');
const  mongoose  = require('mongoose');
const logger = require('./utils/logger');
const helmet = require('helmet')
const cors = require('cors')
const mediaroutes = require('./routes/media-routes');
const errorhandler = require('./middleware/errorhandler');
const {connectRabbitmq,consumeEvents}= require('./utils/rebbitmq');
const { handleDeleteEvent } = require('./event-handlers/media-event-handlers');

const app = express()

const PORT = process.env.PORT

mongoose.connect(process.env.Mongo_Uri).then(()=>{
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


app.use('/api/media',mediaroutes)



app.use(errorhandler)


async function startserver() {
    try {
        await connectRabbitmq()
        await consumeEvents('post.deleted',handleDeleteEvent)

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
