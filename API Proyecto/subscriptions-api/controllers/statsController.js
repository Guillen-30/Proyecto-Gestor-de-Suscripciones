const { connectDB, sql } = require('../config/db');

// ==========================================
// PANTALLA DE ESTADÍSTICAS DETALLADAS
// ==========================================
const getDetailedStats = async (req, res) => {
    const usuarioId = req.user.id;
    
    try {
        const pool = await connectDB();
        
        // 1. Promedio y suma general de los últimos 6 meses
        const queryGeneral = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT
                    SUM(Monto) AS Total6Meses,
                    SUM(Monto) / NULLIF(COUNT(DISTINCT YEAR(Fecha) * 100 + MONTH(Fecha)), 0) AS PromedioMensual
                FROM HistorialDePago
                WHERE UsuarioID = @UsuarioID AND Fecha >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 5, 0)
            `);

        // 2. Comparativa porcentual: Mes actual vs Mes anterior
        const queryComparativa = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                DECLARE @Actual DECIMAL(10,2) = (
                    SELECT ISNULL(SUM(Monto), 0) FROM HistorialDePago 
                    WHERE UsuarioID = @UsuarioID AND MONTH(Fecha) = MONTH(GETDATE()) AND YEAR(Fecha) = YEAR(GETDATE())
                );
                DECLARE @Pasado DECIMAL(10,2) = (
                    SELECT ISNULL(SUM(Monto), 0) FROM HistorialDePago 
                    WHERE UsuarioID = @UsuarioID AND MONTH(Fecha) = MONTH(DATEADD(MONTH, -1, GETDATE())) AND YEAR(Fecha) = YEAR(DATEADD(MONTH, -1, GETDATE()))
                );
                SELECT 
                    @Actual AS MesActual, 
                    @Pasado AS MesPasado, 
                    CASE WHEN @Pasado = 0 THEN 100.0 ELSE ((@Actual - @Pasado) / @Pasado) * 100.0 END AS DiferenciaPorcentual;
            `);

        // 3. Gastos Totales por Categoría (Ahora con Color y sin la tabla intermedia)
        const queryCategorias = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
            SELECT 
                c.Nombre AS name, 
                SUM(h.Monto) AS value,
                c.Color AS color
            FROM HistorialDePago h
            INNER JOIN Suscripcion s ON h.SuscripcionID = s.ID
            INNER JOIN Categoria c ON s.CategoriaID = c.ID
            WHERE h.UsuarioID = @UsuarioID 
            GROUP BY c.Nombre, c.Color
            `);

        res.json({ 
            resumen6Meses: queryGeneral.recordset[0], 
            comparativaMensual: queryComparativa.recordset[0], 
            gastosPorCategoria: queryCategorias.recordset 
        });
    } catch (error) {
        console.error('Error en getDetailedStats:', error);
        res.status(500).json({ error: 'Error al generar estadísticas' });
    }
};

module.exports = { getDetailedStats };