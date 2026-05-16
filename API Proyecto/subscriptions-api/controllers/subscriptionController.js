const { connectDB, sql } = require('../config/db');


// ==========================================
// CREAR SUSCRIPCIÓN (Actualizado con Imágenes)
// ==========================================
const createSubscription = async (req, res) => {
    const usuarioId = req.user.id; 
    
    // Extraemos los nuevos campos imageUrl e imageAlt del body de la petición
    const { 
        metodoDePagoId, cicloFacturacionId, estadoId, categoriaId, 
        descripcion, costo, fechaRenovacion, imageUrl, imageAlt 
    } = req.body;
    
    try {
        const pool = await connectDB();
        
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId) 
            .input('MetodoDePagoID', sql.Int, metodoDePagoId)
            .input('cicloFacturacionID', sql.Int, cicloFacturacionId)
            .input('EstadoID', sql.Int, estadoId)
            .input('CategoriaID', sql.Int, categoriaId || null)
            .input('Descripcion', sql.NVarChar, descripcion || null)
            .input('Costo', sql.Decimal(10, 2), costo)
            .input('FechaRenovacion', sql.Date, fechaRenovacion)
            // Agregamos los nuevos campos para el Stored Procedure
            .input('ImagenURL', sql.NVarChar, imageUrl || null)
            .input('ImagenAlt', sql.NVarChar, imageAlt || null)
            .execute('dbo.spCrearSuscripcion');
            
        res.status(201).json({ 
            message: 'Suscripción creada exitosamente', 
            id: result.recordset[0].ID 
        });
    } catch (error) {
        console.error('Error al crear suscripción:', error);
        res.status(500).json({ error: 'Error al crear la suscripción. Verifica los datos enviados.' });
    }
};

// ==========================================
// ACTUALIZAR SUSCRIPCIÓN (Actualizado con Seguridad e Imágenes)
// ==========================================
const updateSubscription = async (req, res) => {
    const { id } = req.params; 
    const usuarioId = req.user.id; 
    
    const { 
        metodoDePagoId, cicloFacturacionId, estadoId, categoriaId, 
        descripcion, costo, fechaRenovacion, imageUrl, imageAlt 
    } = req.body;
    
    try {
        const pool = await connectDB();
        
        await pool.request()
            .input('ID', sql.Int, id)
            // Tu nuevo SP exige el UsuarioID para evitar que alguien edite la suscripción de otro
            .input('UsuarioID', sql.Int, usuarioId) 
            .input('MetodoDePagoID', sql.Int, metodoDePagoId || null)
            .input('cicloFacturacionID', sql.Int, cicloFacturacionId || null)
            .input('EstadoID', sql.Int, estadoId || null)
            .input('CategoriaID', sql.Int, categoriaId || null)
            .input('Descripcion', sql.NVarChar, descripcion || null)
            .input('Costo', sql.Decimal(10, 2), costo || null)
            .input('FechaRenovacion', sql.Date, fechaRenovacion || null)
            // Agregamos los nuevos campos de imagen
            .input('ImagenURL', sql.NVarChar, imageUrl || null)
            .input('ImagenAlt', sql.NVarChar, imageAlt || null)
            .execute('dbo.spActualizarSuscripcion');
            
        res.json({ message: 'Suscripción actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ error: 'Error al actualizar la suscripción o no tienes permisos.' });
    }
};

// ==========================================
// LISTAR SUSCRIPCIONES DEL USUARIO (Para la vista de tarjetas/lista)
// ==========================================
const getSubscriptions = async (req, res) => {
    const usuarioId = req.user.id; // Filtro de seguridad
    
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT 
                    s.ID AS id, 
                    s.Descripcion AS name, 
                    s.Costo AS cost, 
                    s.FechaRenovacion AS billingDate, 
                    cf.Descripcion AS billingCycle, 
                    mp.Alias AS paymentMethod,
                    e.Descripcion AS status,
                    s.ImagenURL AS imageUrl,
                    s.ImagenAlt AS imageAlt,
                    c.Nombre AS categoryName,
                    c.Color AS categoryColor
                FROM Suscripcion s
                INNER JOIN Estado e ON s.EstadoID = e.ID
                INNER JOIN cicloFacturacion cf ON s.cicloFacturacionID = cf.ID
                INNER JOIN MetodoDePago mp ON s.MetodoDePagoID = mp.ID
                LEFT JOIN Categoria c ON s.CategoriaID = c.ID
                WHERE s.UsuarioID = @UsuarioID
                ORDER BY s.FechaRenovacion ASC
            `);
            
        res.json({ suscripciones: result.recordset });
    } catch (error) {
        console.error('Error al obtener suscripciones:', error);
        res.status(500).json({ error: 'Error al obtener el listado de suscripciones.' });
    }
};

// ==========================================
// ELIMINAR SUSCRIPCIÓN (Seguro y en cascada)
// ==========================================
const deleteSubscription = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id; // Evita que un usuario borre la suscripción de otro
    
    try {
        const pool = await connectDB();
        
        // Ejecutamos tu Stored Procedure de borrado
        await pool.request()
            .input('ID', sql.Int, id)
            .input('UsuarioID', sql.Int, usuarioId)
            .execute('dbo.spEliminarSuscripcion'); 
            
        res.json({ message: 'Suscripción y todo su historial eliminados correctamente' });
    } catch (error) {
        console.error('Error al eliminar suscripción:', error);
        if (error.originalError && error.originalError.info) {
            return res.status(400).json({ error: error.originalError.info.message });
        }
        res.status(500).json({ error: 'Error al eliminar la suscripción.' });
    }
};

// Asegúrate de incluirlas en el module.exports al final del archivo:
module.exports = { 
    createSubscription, 
    updateSubscription, 
    getSubscriptions, // <- Agregada
    deleteSubscription // <- Agregada
};