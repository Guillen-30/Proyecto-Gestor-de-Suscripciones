const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB, sql } = require('../config/db');
const { publishEvent } = require('../config/rabbitmq');

/**
 * Registra un nuevo usuario y su correo asociado
 */
const registerUser = async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    try {
        const pool = await connectDB();
        
        // 1. Validar si el correo ya existe
        const checkUser = await pool.request()
            .input('Correo', sql.NVarChar, correo)
            .execute('dbo.spObtenerUsuarioPorCorreo');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // 2. Encriptar contraseña (Bcrypt genera 60 caracteres, requiere NVARCHAR(255))
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // 3. Crear usuario mediante Stored Procedure
        const result = await pool.request()
            .input('Nombre', sql.NVarChar, nombre)
            .input('Contrasena', sql.NVarChar, hashedPassword)
            .input('Correo', sql.NVarChar, correo)
            .execute('dbo.spCrearUsuario');

        // Obtenemos el ID generado (ajusta según el nombre de columna que devuelva tu SP)
        const userId = result.recordset[0]?.ID || result.recordset[0]?.id;

        // 4. Notificar evento a RabbitMQ
        publishEvent('user_events', {
            eventType: 'USER_CREATED',
            data: { id: userId, nombre, correo }
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId });
    } catch (error) {
        console.error('Error en registerUser:', error);
        res.status(500).json({ error: 'Error interno al procesar el registro' });
    }
};

/**
 * Autentica al usuario y genera un Token JWT
 */
const loginUser = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const pool = await connectDB();

        // 1. Buscar usuario por correo
        const result = await pool.request()
            .input('Correo', sql.NVarChar, correo)
            .execute('dbo.spObtenerUsuarioPorCorreo');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.recordset[0];

        // 2. Comparar contraseña enviada con el hash de la BD
        const validPassword = await bcrypt.compare(contrasena, user.Contrasena);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 3. Generar el Token JWT
        const token = jwt.sign(
            { id: user.ID, nombre: user.Nombre, correo: correo },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.ID, nombre: user.Nombre, correo: correo }
        });
    } catch (error) {
        console.error('Error en loginUser:', error);
        res.status(500).json({ error: 'Error en el servidor durante el login' });
    }
};

/**
 * Actualiza los datos de un usuario existente
 */
const updateUser = async (req, res) => {
    const { id } = req.params;

    if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este usuario' });
    }

    const { nombre, contrasena } = req.body;

    try {
        const pool = await connectDB();
        let hashedPassword = null;

        // Solo encriptamos si el usuario decidió cambiar su contraseña
        if (contrasena) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(contrasena, salt);
        }

        await pool.request()
            .input('ID', sql.Int, id)
            .input('Nombre', sql.NVarChar, nombre)
            .input('Contrasena', sql.NVarChar, hashedPassword)
            .execute('dbo.spActualizarUsuario');

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error en updateUser:', error);
        res.status(500).json({ error: 'Error al actualizar los datos del usuario' });
    }
};

/**
 * Elimina un usuario del sistema
 */
const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este usuario' });
    }

    try {
        const pool = await connectDB();
        
        await pool.request()
            .input('ID', sql.Int, id)
            .execute('dbo.spEliminarUsuario');

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error en deleteUser:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUser,
    deleteUser
};