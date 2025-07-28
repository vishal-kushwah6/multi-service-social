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

async function publishevent (routingkey,message) {

    if(!channel){
        await connectRabbitmq()
    }
    
    channel.publish(ExchangeName,routingkey,Buffer.from(JSON.stringify(message)))
    logger.info(`Event published: ${routingkey }`)
}


module.exports ={connectRabbitmq,publishevent }