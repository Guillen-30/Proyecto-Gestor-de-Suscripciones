const { connectDB, sql } = require('../config/db');

const getSubscriptionFormData = async (req, res) => {
    const usuarioId = req.user.id;
    
    try {
        const pool = await connectDB();
        
        const [categories, paymentMethods, billingCycles, statuses] = await Promise.all([
            // 1. Categorías del usuario
            pool.request()
                .input('UsuarioID', sql.Int, usuarioId)
                .query('SELECT ID AS id, Nombre AS name, Color AS color FROM Categoria WHERE UsuarioID = @UsuarioID ORDER BY Nombre ASC'),
            
            // 2. Métodos de pago del usuario
            pool.request()
                .input('UsuarioID', sql.Int, usuarioId)
                .query('SELECT ID AS id, Alias AS alias FROM MetodoDePago WHERE UsuarioID = @UsuarioID ORDER BY Alias ASC'),
            
            // 3. Ciclos de facturación (Catálogo global)
            pool.request()
                .query('SELECT ID AS id, Descripcion AS description FROM cicloFacturacion'),
            
            // 4. Estados (Catálogo global)
            pool.request()
                .query('SELECT ID AS id, Descripcion AS description FROM Estado')
        ]);
        
        // Enviamos las llaves del JSON en camelCase
        res.json({ 
            categorias: categories.recordset, 
            metodosPago: paymentMethods.recordset, 
            ciclosFacturacion: billingCycles.recordset, 
            estados: statuses.recordset 
        });
    } catch (error) {
        console.error('Error al cargar catálogos:', error);
        res.status(500).json({ error: 'Error al cargar los datos para el formulario.' });
    }
};

module.exports = { getSubscriptionFormData };