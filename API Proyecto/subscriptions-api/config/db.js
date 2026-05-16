const sql = require('mssql');
require('dotenv').config();

// Configuración de conexión a SQL Server
const dbSettings = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // Cambiar a true si subes la base de datos a Azure
        trustServerCertificate: true // Necesario para conexiones locales en Docker
    }
};

// Función para inicializar la conexión al pool de base de datos
const connectDB = async () => {
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.error('Error conectando a SQL Server:', error);
        throw error;
    }
};

module.exports = { connectDB, sql };