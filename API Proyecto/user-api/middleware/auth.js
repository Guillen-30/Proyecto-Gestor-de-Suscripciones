const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. El token suele enviarse en los headers bajo la llave "Authorization"
    // El formato estándar es: "Bearer eyJhbGciOiJIUzI1..."
    const authHeader = req.headers['authorization'];
    
    // Si no hay header o no empieza con "Bearer ", le negamos el acceso
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    }

    // 2. Extraemos solo el token (quitamos la palabra "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verificamos que el token sea auténtico y no haya expirado
        // Si el JWT_SECRET no coincide o el tiempo pasó, esto lanzará un error y caerá en el catch
        const payloadDecodificado = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Si todo está bien, guardamos los datos del usuario en la petición (req)
        // Así, los controladores (updateUser, deleteUser) sabrán exactamente quién está haciendo la petición
        req.user = payloadDecodificado;

        // 5. ¡Le abrimos la puerta! next() le dice a Express que pase al siguiente bloque de código
        next();
    } catch (error) {
        console.error('Error al verificar el token:', error.message);
        return res.status(403).json({ error: 'Token inválido o expirado. Por favor, inicia sesión de nuevo.' });
    }
};

module.exports = { verificarToken };