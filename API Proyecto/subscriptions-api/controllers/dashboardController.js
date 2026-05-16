const { connectDB, sql } = require('../config/db');

// ==========================================
// RESUMEN PRINCIPAL (Total Activas y Gasto REAL del Mes)
// ==========================================
const getDashboardSummary = async (req, res) => {
    const usuarioId = req.user.id;
    
    try {
        const pool = await connectDB();
        
        // 1. Traemos las suscripciones activas del usuario para listarlas en la tabla del panel
        const queryLista = await pool.request()
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
                    s.ImagenAlt AS imageAlt
                FROM Suscripcion s
                INNER JOIN Estado e ON s.EstadoID = e.ID
                INNER JOIN cicloFacturacion cf ON s.cicloFacturacionID = cf.ID
                INNER JOIN MetodoDePago mp ON s.MetodoDePagoID = mp.ID
                WHERE s.UsuarioID = @UsuarioID AND e.Descripcion = 'Activa'
            `);

        // 2. NUEVA LÓGICA: Calculamos la suma REAL de lo pagado en el mes y año actuales
        const queryGastoReal = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT ISNULL(SUM(Monto), 0) AS GastoRealMes
                FROM HistorialDePago
                WHERE UsuarioID = @UsuarioID 
                  AND MONTH(Fecha) = MONTH(GETDATE()) 
                  AND YEAR(Fecha) = YEAR(GETDATE())
            `);
            
        const suscripcionesActivas = queryLista.recordset;
        const gastoMensualReal = parseFloat(queryGastoReal.recordset[0].GastoRealMes);
        
        // Enviamos la respuesta estructurada al frontend
        res.json({
            totalSuscripcionesActivas: suscripcionesActivas.length,
            gastoMensualTotal: parseFloat(gastoMensualReal.toFixed(2)), // Ahora representa el gasto real ejecutado
            listaSuscripciones: suscripcionesActivas
        });
    } catch (error) {
        console.error('Error en getDashboardSummary:', error);
        res.status(500).json({ error: 'Error al obtener resumen del dashboard' });
    }
};

// ==========================================
// RESUMEN DE PRÓXIMOS PAGOS
// ==========================================
const getUpcomingPayments = async (req, res) => {
    const usuarioId = req.user.id;
    
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
                e.Descripcion AS status,
                s.ImagenURL AS imageUrl
            FROM Suscripcion s
            INNER JOIN Estado e ON s.EstadoID = e.ID
            WHERE s.UsuarioID = @UsuarioID AND e.Descripcion IN ('Activa', 'Por vencer') 
            AND s.FechaRenovacion >= CAST(GETDATE() AS DATE)
            ORDER BY s.FechaRenovacion ASC
        `);
            
        const todasPendientes = result.recordset;
        
        // Extraemos el más próximo (el primero de la lista)
        const proximoPago = todasPendientes.length > 0 ? todasPendientes[0] : null;
        
        // Filtramos para obtener los que ocurren dentro de los próximos 7 días
        const hoy = new Date();
        const enUnaSemana = new Date();
        enUnaSemana.setDate(hoy.getDate() + 7);
        
        const pagosDeLaSemana = todasPendientes.filter(sub => {
            // CORRECCIÓN: Usamos el alias 'billingDate' que viene del SELECT
            const fecha = new Date(sub.billingDate); 
            return fecha >= hoy && fecha <= enUnaSemana;
        });
        
        res.json({ proximoPago, pagosDeLaSemana });
    } catch (error) {
        console.error('Error en getUpcomingPayments:', error);
        res.status(500).json({ error: 'Error al obtener próximos pagos' });
    }
};


// ==========================================
// RESUMEN DE GASTOS PASADOS (Gráfico de Líneas/Barras)
// ==========================================
const getExpensesPast6Months = async (req, res) => {
    const usuarioId = req.user.id;
    try {
        const pool = await connectDB();
        
        // 1. SET LANGUAGE asegura que DATENAME devuelva 'Enero', 'Diciembre', etc.
        // 2. Usamos LEFT(..., 3) para cortar la palabra a 'Ene', 'Dic'.
        // 3. Ordenamos ASCENDENTE para que el gráfico fluya de izquierda a derecha.
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SET LANGUAGE Spanish; 
                
                SELECT 
                    LEFT(DATENAME(MONTH, Fecha), 3) AS month, 
                    SUM(Monto) AS amount,
                    YEAR(Fecha) AS year_num,
                    MONTH(Fecha) AS month_num
                FROM HistorialDePago 
                WHERE UsuarioID = @UsuarioID 
                  AND Fecha >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 5, 0)
                GROUP BY YEAR(Fecha), MONTH(Fecha), DATENAME(MONTH, Fecha)
                ORDER BY YEAR(Fecha) ASC, MONTH(Fecha) ASC
            `);
            
        // Limpiamos los datos extra (year_num, month_num) que usamos solo para que SQL ordenara bien
        const monthlyTrend = result.recordset.map(item => ({
            month: item.month,
            amount: item.amount
        }));

        // Lo devolvemos exactamente como lo espera el Frontend
        res.json(monthlyTrend); 
    } catch (error) {
        console.error('Error en getExpensesPast6Months:', error);
        res.status(500).json({ error: 'Error al obtener el historial de meses' });
    }
};

module.exports = { getDashboardSummary, getUpcomingPayments, getExpensesPast6Months };