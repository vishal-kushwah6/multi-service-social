const ampq = require('amqplib')
const logger = require('../utils/logger')

let connection = null
let channel = null

const ExchangeName = 'facebook_events'

async function connectRabbitmq() {

    try {

        connection = await ampq.connect(process.env.RABBITMQ_URL)
        channel = await connection.createChannel()
        await channel.assertExchange(ExchangeName,'topic',{durable : false})

        logger.info('rabbit connected!')
        return channel
        
    } catch (error) {
        logger.error(`Error connecting to RabbitMQ: ${error.message}`, {
        service: 'post-service',
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
        
    }
    

}



async function consumeEvents(routingkey,callback) {
    if(!channel){
        await connectRabbitmq()
    }
    const q = await channel.assertQueue("",{exclusive:true})

    await channel.bindQueue (q.queue,ExchangeName,routingkey)

    channel.consume(q.queue,(msg)=>{
        if(msg!=null){
            const content = JSON.parse(msg.content.toString())
            callback(content)
            channel.ack(msg)
        }
    })

    logger.info('subscribed to event:', routingkey)
}


module.exports ={connectRabbitmq,consumeEvents}