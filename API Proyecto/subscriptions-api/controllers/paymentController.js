const { connectDB, sql } = require('../config/db');

// ==========================================
// CARGAR DATOS PARA EL FORMULARIO DE PAGO
// ==========================================
const getPaymentFormData = async (req, res) => {
    const usuarioId = req.user.id;
    try {
        const pool = await connectDB();
        
        // Consultamos en paralelo para enviar todo en una sola petición al frontend
        const [subscriptions, paymentMethods] = await Promise.all([
            pool.request()
                .input('UsuarioID', sql.Int, usuarioId)
                .query(`
                    SELECT s.ID, s.Descripcion, s.Costo, s.MetodoDePagoID 
                    FROM Suscripcion s
                    INNER JOIN Estado e ON s.EstadoID = e.ID
                    WHERE s.UsuarioID = @UsuarioID AND e.Descripcion <> 'Cancelada'
                `),
            pool.request()
                .input('UsuarioID', sql.Int, usuarioId)
                .query('SELECT ID, Alias FROM MetodoDePago WHERE UsuarioID = @UsuarioID ORDER BY Alias ASC')
        ]);
        
        res.json({ suscripciones: subscriptions.recordset, metodosPago: paymentMethods.recordset });
    } catch (error) {
        console.error('Error al cargar datos del formulario:', error);
        res.status(500).json({ error: 'Error al cargar datos del formulario' });
    }
};

// ==========================================
// PROCESAR UN PAGO MANUAL
// ==========================================
const registerPayment = async (req, res) => {
    const usuarioId = req.user.id;
    const { suscripcionId, metodoDePagoId, monto, fecha } = req.body;
    
    try {
        const pool = await connectDB();
        
        // 1. Actualizamos el método de pago solo si el usuario eligió uno
        if (metodoDePagoId) {
            await pool.request()
                .input('SuscripcionID', sql.Int, suscripcionId)
                .input('MetodoDePagoID', sql.Int, metodoDePagoId)
                .query('UPDATE Suscripcion SET MetodoDePagoID = @MetodoDePagoID WHERE ID = @SuscripcionID');
        }
            
        // 2. Registramos el movimiento en el historial y calculamos la nueva fecha de corte
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .input('SuscripcionID', sql.Int, suscripcionId)
            .input('Monto', sql.Decimal(10, 2), monto)
            .input('Fecha', sql.Date, fecha || null)
            .execute('dbo.spRegistrarPago');
            
        res.status(201).json({ 
            message: 'Pago procesado exitosamente', 
            nuevaFechaRenovacion: result.recordset[0].NuevaFechaRenovacion 
        });
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ error: 'Error al procesar el pago' });
    }
};

// ==========================================
// CONSULTAR HISTORIAL GENERAL
// ==========================================
const getHistory = async (req, res) => {
    const usuarioId = req.user.id;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT h.ID, h.Fecha, h.Monto, h.SuscripcionID, s.Descripcion AS Suscripcion,
                       s.MetodoDePagoID, mp.Alias AS MetodoPago
                FROM HistorialDePago h
                INNER JOIN Suscripcion s ON h.SuscripcionID = s.ID
                LEFT JOIN MetodoDePago mp ON s.MetodoDePagoID = mp.ID
                WHERE h.UsuarioID = @UsuarioID
                ORDER BY h.Fecha DESC
            `);
        res.json({ historial: result.recordset });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};

// ==========================================
// CONSULTAR PRÓXIMOS COBROS
// ==========================================
// Reemplaza getUpcomingSubscriptions:
const getUpcomingSubscriptions = async (req, res) => {
    const dias = req.query.dias ? parseInt(req.query.dias) : 7;
    const usuarioId = req.user.id;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('DiasAnticipacion', sql.Int, dias)
            .execute('dbo.spObtenerSuscripcionesPorVencer');
            
        // El SP devuelve las de todos los usuarios, filtramos por el actual
        const suscripcionesUsuario = result.recordset.filter(s => s.UsuarioID === usuarioId);
        
        // Mapeamos al formato en inglés para React
        const datosFormateados = suscripcionesUsuario.map(sub => ({
            id: sub.SuscripcionID,
            name: sub.Suscripcion,
            billingDate: sub.FechaRenovacion,
            cost: sub.Costo,
            imageUrl: sub.ImagenURL,
            imageAlt: sub.ImagenAlt,
            categoryColor: sub.ColorCategoria,
            categoryName: sub.NombreCategoria,
            daysRemaining: sub.DiasRestantes
        }));

        res.json({ proximasAVencer: datosFormateados });
    } catch (error) {
        console.error('Error al obtener próximos cobros:', error);
        res.status(500).json({ error: 'Error al obtener próximos cobros' });
    }
};

// ==========================================
// EDITAR PAGO DEL HISTORIAL
// ==========================================
const updatePayment = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const { monto, fecha, suscripcionId, metodoDePagoId } = req.body;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('ID', sql.Int, id)
            .input('UsuarioID', sql.Int, usuarioId)
            .input('Monto', sql.Decimal(10, 2), monto)
            .input('Fecha', sql.Date, fecha)
            .input('SuscripcionID', sql.Int, suscripcionId || null)
            .query(`
                UPDATE HistorialDePago
                SET Monto = @Monto, Fecha = @Fecha,
                    SuscripcionID = ISNULL(@SuscripcionID, SuscripcionID)
                WHERE ID = @ID AND UsuarioID = @UsuarioID
            `);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Pago no encontrado o sin permisos' });
        }
        // Update the subscription's payment method if both IDs are provided
        if (suscripcionId && metodoDePagoId !== undefined) {
            await pool.request()
                .input('SuscripcionID', sql.Int, suscripcionId)
                .input('MetodoDePagoID', sql.Int, metodoDePagoId || null)
                .query('UPDATE Suscripcion SET MetodoDePagoID = @MetodoDePagoID WHERE ID = @SuscripcionID');
        }
        res.json({ message: 'Pago actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar pago:', error);
        res.status(500).json({ error: 'Error al actualizar el pago' });
    }
};

// ==========================================
// ELIMINAR PAGO DEL HISTORIAL
// ==========================================
const deletePayment = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('ID', sql.Int, id)
            .input('UsuarioID', sql.Int, usuarioId)
            .query('DELETE FROM HistorialDePago WHERE ID = @ID AND UsuarioID = @UsuarioID');
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Pago no encontrado o sin permisos' });
        }
        res.json({ message: 'Pago eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar pago:', error);
        res.status(500).json({ error: 'Error al eliminar el pago' });
    }
};

module.exports = { getPaymentFormData, registerPayment, getHistory, getUpcomingSubscriptions, deletePayment, updatePayment };