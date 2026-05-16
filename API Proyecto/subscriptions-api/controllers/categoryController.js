const { connectDB, sql } = require('../config/db');

// ==========================================
// LEER CATEGORÍAS DEL USUARIO
// ==========================================
const getCategories = async (req, res) => {
    const usuarioId = req.user.id; 
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT 
                    c.ID AS id, 
                    c.Nombre AS name, 
                    c.Descripcion AS description,
                    c.Color AS color,
                    (SELECT COUNT(*) FROM Suscripcion s WHERE s.CategoriaID = c.ID) AS subscriptionCount
                FROM Categoria c 
                WHERE c.UsuarioID = @UsuarioID 
                ORDER BY c.Nombre ASC
            `);
        res.json({ categorias: result.recordset });
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar categorías' });
    }
};

// ==========================================
// CREAR CATEGORÍA
// ==========================================
// Reemplaza createCategory:
const createCategory = async (req, res) => {
    const usuarioId = req.user.id;
    const { nombre, descripcion, color } = req.body; // Añadimos color
    
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .input('Nombre', sql.NVarChar, nombre)
            .input('Descripcion', sql.NVarChar, descripcion || null)
            .input('Color', sql.NVarChar, color || null) // NUEVO PARÁMETRO
            .execute('dbo.spCrearCategoria');
            
        res.status(201).json({ message: 'Categoría creada exitosamente', id: result.recordset[0].ID });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

// Reemplaza updateCategory:
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, color } = req.body; // Añadimos color
    
    try {
        const pool = await connectDB();
        await pool.request()
            .input('ID', sql.Int, id)
            .input('Nombre', sql.NVarChar, nombre || null)
            .input('Descripcion', sql.NVarChar, descripcion || null)
            .input('Color', sql.NVarChar, color || null) // NUEVO PARÁMETRO
            .execute('dbo.spActualizarCategoria');
            
        res.json({ message: 'Categoría actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

// ==========================================
// ELIMINAR CATEGORÍA
// ==========================================
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    
    try {
        const pool = await connectDB();
        await pool.request().input('ID', sql.Int, id).execute('dbo.spEliminarCategoria');
        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };