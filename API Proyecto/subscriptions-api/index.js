require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Puerto de Vite
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Importamos todas las rutas que centralizamos
const apiRoutes = require('./routes/allRoutes');

// Middleware para que Express entienda el formato JSON en el Body de las peticiones
app.use(express.json());

// ==========================================
// MONTAJE DE RUTAS
// ==========================================
// Todas nuestras rutas vivirán debajo del prefijo /api/
app.use('/api', apiRoutes);

// Manejo de rutas no encontradas (Error 404 personalizado)
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada en el microservicio de Suscripciones' });
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Subscriptions API ejecutándose en http://localhost:${PORT}`);
    console.log(`Todas las rutas protegidas activas bajo /api/...`);
});