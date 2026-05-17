require('dotenv').config();
const express = require('express');
const { connectRabbitMQ } = require('./config/rabbitmq');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

// Iniciar RabbitMQ
//connectRabbitMQ();

// Rutas
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`User API ejecutándose en http://localhost:${PORT}`);
});