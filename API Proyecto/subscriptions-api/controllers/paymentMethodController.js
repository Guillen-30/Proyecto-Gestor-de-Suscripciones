const { connectDB, sql } = require('../config/db');

// ==========================================
// OBTENER MÉTODOS DE PAGO DEL USUARIO (Filtrado seguro)
// ==========================================
const getPaymentMethods = async (req, res) => {
    const usuarioId = req.user.id; 
    
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT 
                    mp.ID AS id, 
                    mp.Alias AS alias, 
                    t.Descripcion AS type, 
                    'Terminada en ****' AS details, 
                    CAST(0 AS BIT) AS isDefault
                FROM MetodoDePago mp 
                INNER JOIN Tipo t ON mp.TipoID = t.ID 
                WHERE mp.UsuarioID = @UsuarioID  -- Filtro vital de privacidad
                ORDER BY mp.Alias ASC
            `);
            
        res.json({ metodosPago: result.recordset });
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
        res.status(500).json({ error: 'Error al obtener métodos de pago' });
    }
};

// ==========================================
// CREAR MÉTODO DE PAGO (Inyecta el UsuarioID al SP)
// ==========================================
const createPaymentMethod = async (req, res) => {
    const usuarioId = req.user.id; 
    const { tipoId, alias } = req.body;
    
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId) 
            .input('TipoID', sql.Int, tipoId)
            .input('Alias', sql.NVarChar, alias)
            .execute('dbo.spCrearMetodoPago');
            
        res.status(201).json({ message: 'Método creado exitosamente', id: result.recordset[0].ID });
    } catch (error) {
        console.error('Error al crear método:', error);
        res.status(500).json({ error: 'Error al crear método de pago' });
    }
};

// ==========================================
// ELIMINAR MÉTODO DE PAGO (Validación multitenant en el SP)
// ==========================================
const deletePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id; 
    
    try {
        const pool = await connectDB();
        await pool.request()
            .input('ID', sql.Int, id)
            .input('UsuarioID', sql.Int, usuarioId) 
            .execute('dbo.spEliminarMetodoPago');
            
        res.json({ message: 'Método de pago eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar método:', error);
        
        // Capturamos el RAISERROR de SQL Server (ej. "tiene suscripciones activas")
        if (error.originalError && error.originalError.info) {
            return res.status(400).json({ error: error.originalError.info.message });
        }
        res.status(500).json({ error: 'Error al eliminar método de pago' });
    }
};
// ==========================================
// ACTUALIZAR MÉTODO DE PAGO (Lógica directa en la API)
// ==========================================
const updatePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id; 
    const { tipoId, alias } = req.body;
    
    try {
        const pool = await connectDB();
        
        // Lanzamos el UPDATE directamente usando la API de mssql
        const result = await pool.request()
            .input('ID', sql.Int, id)
            .input('UsuarioID', sql.Int, usuarioId) 
            .input('TipoID', sql.Int, tipoId)
            .input('Alias', sql.NVarChar, alias)
            .query(`
                UPDATE MetodoDePago 
                SET TipoID = @TipoID, Alias = @Alias 
                WHERE ID = @ID AND UsuarioID = @UsuarioID
            `);
            
        // Si no se modificó ninguna fila, significa que el ID no existe o le pertenece a otro usuario
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Método de pago no encontrado o no tienes permisos para editarlo.' });
        }
            
        res.json({ message: 'Método de pago actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar método:', error);
        res.status(500).json({ error: 'Error al actualizar método de pago' });
    }
};
module.exports = { getPaymentMethods, createPaymentMethod, deletePaymentMethod, updatePaymentMethod };