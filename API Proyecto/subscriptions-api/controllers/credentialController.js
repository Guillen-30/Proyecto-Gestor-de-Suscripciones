const { encrypt, decrypt } = require('../utils/cryptoUtils');
const { connectDB, sql } = require('../config/db');

// ==========================================
// LEER CREDENCIALES (Bóveda)
// ==========================================
// ==========================================
// OBTENER CREDENCIALES (Con búsqueda y desencriptado)
// ==========================================
const getCredentials = async (req, res) => {
    const usuarioId = req.user.id;
    const { nombre } = req.query; // Capturamos si viene ?nombre=... en la URL
    
    try {
        const pool = await connectDB();
        
        // 1. Preparamos la consulta base
        let query = `
            SELECT
                ID as id,
                Descripcion as name,
                NombreUsuario as username,
                Contrasena as password,
                URL as url
            FROM Credencial
            WHERE UsuarioID = @UsuarioID
        `;

        const request = pool.request().input('UsuarioID', sql.Int, usuarioId);

        // 2. Si el frontend envió un término de búsqueda, lo agregamos a la consulta
        if (nombre) {
            query += ` AND Descripcion LIKE @Nombre`;
            request.input('Nombre', sql.NVarChar, `%${nombre}%`);
        }

        // 3. Ordenamos alfabéticamente para que se vea limpio en la UI
        query += ` ORDER BY Descripcion ASC`;

        // 4. Ejecutamos la consulta en SQL Server
        const result = await request.query(query);
            
        // 5. Desencriptar las contraseñas antes de enviarlas al frontend
        const credencialesDesencriptadas = result.recordset.map(cred => {
            try {
                // Usamos la función decrypt de tu archivo utils/cryptoUtils
                const passwordLimpio = decrypt(cred.password);
                return {
                    ...cred,
                    password: passwordLimpio
                };
            } catch (err) {
                // Si por alguna razón una contraseña se guardó mal o se corrompió, 
                // evitamos que la API crashee y arruine toda la lista.
                console.error(`Error al desencriptar la credencial ID ${cred.id}:`, err);
                return {
                    ...cred,
                    password: 'Error_Desencriptacion' 
                };
            }
        });
        
        // 6. Enviamos el JSON final al frontend
        res.json({ credenciales: credencialesDesencriptadas });
        
    } catch (error) {
        console.error('Error al obtener credenciales:', error);
        res.status(500).json({ error: 'Error al obtener la bóveda de credenciales.' });
    }
};

// ==========================================
// GUARDAR NUEVA CREDENCIAL
// ==========================================
const createCredential = async (req, res) => {
    const usuarioId = req.user.id;
    const { suscripcionId, contrasena, nombreUsuario, url, descripcion } = req.body;
    
    try {
        const pool = await connectDB();
        
        // ¡Importante! Encriptamos la contraseña para que sea una bóveda segura
        const hashedPassword = encrypt(contrasena);
        
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .input('SuscripcionID', sql.Int, suscripcionId || null)
            .input('Contrasena', sql.NVarChar, hashedPassword) // Guardamos el hash
            .input('NombreUsuario', sql.NVarChar, nombreUsuario)
            .input('URL', sql.NVarChar, url || null)
            .input('Descripcion', sql.NVarChar, descripcion || null)
            .execute('dbo.spCrearCredencial');
            
        res.status(201).json({ 
            message: 'Credencial guardada de forma segura', 
            id: result.recordset[0].ID 
        });
    } catch (error) {
        console.error('Error al crear credencial:', error);
        res.status(500).json({ error: 'Error al crear credencial' });
    }
};

// ==========================================
// ACTUALIZAR CREDENCIAL
// ==========================================
const updateCredential = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const { suscripcionId, contrasena, nombreUsuario, url, descripcion } = req.body;

    try {
        const pool = await connectDB();

        const ownership = await pool.request()
            .input('ID', sql.Int, id)
            .input('UsuarioID', sql.Int, usuarioId)
            .query('SELECT ID FROM Credencial WHERE ID = @ID AND UsuarioID = @UsuarioID');

        if (ownership.recordset.length === 0) {
            return res.status(403).json({ error: 'No tienes permiso para modificar esta credencial' });
        }

        let hashedPassword = null;

        // Solo encriptamos si el usuario decidió modificar la contraseña
        if (contrasena) {
            hashedPassword = encrypt(contrasena);
        }
        
        await pool.request()
            .input('ID', sql.Int, id)
            .input('SuscripcionID', sql.Int, suscripcionId || null)
            .input('Contrasena', sql.NVarChar, hashedPassword) 
            .input('NombreUsuario', sql.NVarChar, nombreUsuario || null)
            .input('URL', sql.NVarChar, url || null)
            .input('Descripcion', sql.NVarChar, descripcion || null)
            .execute('dbo.spActualizarCredencial');
            
        res.json({ message: 'Credencial actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar credencial:', error);
        res.status(500).json({ error: 'Error al actualizar credencial' });
    }
};

// ==========================================
// ELIMINAR CREDENCIAL
// ==========================================
const deleteCredential = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;

    try {
        const pool = await connectDB();

        const ownership = await pool.request()
            .input('ID', sql.Int, id)
            .input('UsuarioID', sql.Int, usuarioId)
            .query('SELECT ID FROM Credencial WHERE ID = @ID AND UsuarioID = @UsuarioID');

        if (ownership.recordset.length === 0) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta credencial' });
        }

        await pool.request()
            .input('ID', sql.Int, id)
            .execute('dbo.spEliminarCredencial');
            
        res.json({ message: 'Credencial eliminada de la bóveda' });
    } catch (error) {
        console.error('Error al eliminar credencial:', error);
        res.status(500).json({ error: 'Error al eliminar credencial' });
    }
};

module.exports = { getCredentials, createCredential, updateCredential, deleteCredential };