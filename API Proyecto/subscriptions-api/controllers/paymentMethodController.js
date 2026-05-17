const { connectDB, sql } = require('../config/db');

const getPaymentMethods = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query(`
                SELECT
                    mp.ID AS id,
                    mp.Alias AS alias,
                    t.Descripcion AS type,
                    mp.Detalles AS details,
                    CAST(0 AS BIT) AS isDefault
                FROM MetodoDePago mp
                INNER JOIN Tipo t ON mp.TipoID = t.ID
                ORDER BY mp.Alias ASC
            `);
        res.json({ metodosPago: result.recordset });
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
        res.status(500).json({ error: 'Error al obtener métodos de pago' });
    }
};

const createPaymentMethod = async (req, res) => {
    const { tipoId, alias, detalles } = req.body;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('TipoID', sql.Int, tipoId)
            .input('Alias', sql.NVarChar, alias)
            .input('Detalles', sql.NVarChar, detalles || null)
            .execute('dbo.spCrearMetodoPago');
        res.status(201).json({ message: 'Método creado exitosamente', id: result.recordset[0].ID });
    } catch (error) {
        console.error('Error al crear método:', error);
        res.status(500).json({ error: 'Error al crear método de pago' });
    }
};

const deletePaymentMethod = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('ID', sql.Int, id)
            .execute('dbo.spEliminarMetodoPago');
        res.json({ message: 'Método de pago eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar método:', error);
        if (error.originalError && error.originalError.info) {
            return res.status(400).json({ error: error.originalError.info.message });
        }
        res.status(500).json({ error: 'Error al eliminar método de pago' });
    }
};

const updatePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const { tipoId, alias, detalles } = req.body;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('ID', sql.Int, id)
            .input('TipoID', sql.Int, tipoId)
            .input('Alias', sql.NVarChar, alias)
            .input('Detalles', sql.NVarChar, detalles ?? null)
            .query(`
                UPDATE MetodoDePago
                SET TipoID = @TipoID, Alias = @Alias, Detalles = @Detalles
                WHERE ID = @ID
            `);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Método de pago no encontrado.' });
        }
        res.json({ message: 'Método de pago actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar método:', error);
        res.status(500).json({ error: 'Error al actualizar método de pago' });
    }
};

const getPaymentTypes = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query('SELECT ID AS id, Descripcion AS description FROM Tipo ORDER BY Descripcion ASC');
        res.json({ tipos: result.recordset });
    } catch (error) {
        console.error('Error al obtener tipos de pago:', error);
        res.status(500).json({ error: 'Error al obtener tipos de pago' });
    }
};

module.exports = { getPaymentMethods, getPaymentTypes, createPaymentMethod, deletePaymentMethod, updatePaymentMethod };
