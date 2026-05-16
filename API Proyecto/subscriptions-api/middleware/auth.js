const jwt = require('jsonwebtoken');

// El "Cadenero": Middleware que protege todas las rutas del microservicio
const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en los headers
    const authHeader = req.headers['authorization'];
    
    // 2. Si no hay token o no tiene el formato correcto, bloqueamos el paso
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. Token no válido.' });
    }
    
    // 3. Extraemos el texto del token
    const token = authHeader.split(' ')[1];
    
    try {
        // 4. Verificamos que sea auténtico usando nuestra llave secreta
        // Si es válido, guardamos los datos del usuario en req.user
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next(); // Le permitimos continuar hacia el controlador
    } catch (error) {
        return res.status(403).json({ error: 'Token expirado o inválido.' });
    }
};

module.exports = { verificarToken };