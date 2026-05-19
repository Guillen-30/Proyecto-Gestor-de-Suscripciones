const { connectDB, sql } = require('../config/db');

const getPaymentMethods = async (req, res) => {
    const usuarioId = req.user.id;
    try {
        const usuarioId = req.user?.id ?? null;
        const pool = await connectDB();
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT
                    mp.ID AS id,
                    mp.Alias AS alias,
                    t.Descripcion AS type,
                    mp.Detalles AS details,
                    CASE WHEN mp.ID = (SELECT MetodoDePagoID FROM Usuario WHERE ID = @UsuarioID) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS isDefault
                FROM MetodoDePago mp
                INNER JOIN Tipo t ON mp.TipoID = t.ID
                WHERE mp.UsuarioID = @UsuarioID
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
    const usuarioId = req.user.id;
    try {
        const usuarioId = req.user?.id ?? null;
        const pool = await connectDB();
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .input('TipoID', sql.Int, tipoId)
            .input('Alias', sql.NVarChar(40), alias)
            .input('Detalles', sql.NVarChar(500), detalles || null)
            .execute('dbo.spCrearMetodoPago');
        res.status(201).json({ message: 'Método creado exitosamente', id: result.recordset[0].ID });
    } catch (error) {
        console.error('Error al crear método:', error);
        res.status(500).json({ error: 'Error al crear método de pago' });
    }
};

const deletePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;
    try {
        const usuarioId = req.user?.id ?? null;
        const pool = await connectDB();

        // Only owner can delete their payment methods
        const ownerCheck = await pool.request()
            .input('ID', sql.Int, id)
            .query('SELECT UsuarioID FROM MetodoDePago WHERE ID = @ID');

        if (!ownerCheck.recordset.length) {
            return res.status(404).json({ error: 'Método de pago no encontrado.' });
        }

        const owner = ownerCheck.recordset[0]?.UsuarioID ?? null;
        if (owner !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este método de pago' });
        }

        await pool.request()
            .input('ID', sql.Int, id)
            .input('UsuarioID', sql.Int, usuarioId)
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
    const usuarioId = req.user.id;
    try {
        const usuarioId = req.user?.id ?? null;
        const pool = await connectDB();

        // Ensure the method belongs to the user (don't allow editing global methods or others')
        const ownerCheck = await pool.request()
            .input('ID', sql.Int, id)
            .query('SELECT UsuarioID FROM MetodoDePago WHERE ID = @ID');

        const owner = ownerCheck.recordset[0]?.UsuarioID ?? null;
        if (owner !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para modificar este método de pago' });
        }

        const result = await pool.request()
            .input('ID', sql.Int, id)
            .input('UsuarioID', sql.Int, usuarioId)
            .input('TipoID', sql.Int, tipoId)
            .input('Alias', sql.NVarChar(40), alias)
            .input('Detalles', sql.NVarChar(500), detalles ?? null)
            .query(`
                UPDATE MetodoDePago
                SET TipoID = @TipoID, Alias = @Alias, Detalles = @Detalles
                WHERE ID = @ID AND UsuarioID = @UsuarioID
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

const setDefaultPaymentMethod = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user?.id ?? null;
    try {
        const pool = await connectDB();

        // Check method exists and ownership (allow if global or owned by user)
        const check = await pool.request()
            .input('ID', sql.Int, id)
            .query('SELECT UsuarioID FROM MetodoDePago WHERE ID = @ID');

        const owner = check.recordset[0]?.UsuarioID;
        if (!check.recordset.length) {
            return res.status(404).json({ error: 'Método de pago no encontrado.' });
        }
        if (owner !== null && owner !== usuarioId) {
            return res.status(403).json({ error: 'No puedes establecer como predeterminado un método de otro usuario.' });
        }

        // Set as user's default
        await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .input('MetodoDePagoID', sql.Int, id)
            .query('UPDATE Usuario SET MetodoDePagoID = @MetodoDePagoID WHERE ID = @UsuarioID');

        res.json({ message: 'Método establecido como predeterminado.' });
    } catch (error) {
        console.error('Error al establecer método predeterminado:', error);
        res.status(500).json({ error: 'Error estableciendo método predeterminado' });
    }
};

module.exports.setDefaultPaymentMethod = setDefaultPaymentMethod;
