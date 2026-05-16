require('dotenv').config();
const express = require('express');
const { connectRabbitMQ } = require('./config/rabbitmq');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

// Iniciar RabbitMQ
//connectRabbitMQ();

// Rutas
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`User API ejecutándose en http://localhost:${PORT}`);
});