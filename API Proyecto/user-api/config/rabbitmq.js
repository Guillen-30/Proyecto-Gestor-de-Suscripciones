const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('user_events', { durable: true });
        console.log('Conectado a RabbitMQ exitosamente');
    } catch (error) {
        console.error('Error conectando a RabbitMQ:', error);
    }
};

const publishEvent = (queue, data) => {
    if (channel) {
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
        console.log(`Evento publicado en la cola ${queue}`);
    }
};

module.exports = { connectRabbitMQ, publishEvent };