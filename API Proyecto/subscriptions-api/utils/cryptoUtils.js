const crypto = require('crypto');

// Usamos el algoritmo AES-256-CBC
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY;

// Asegurarnos de que la llave tenga 32 bytes
const key = Buffer.from(secretKey).slice(0, 32); 

const encrypt = (text) => {
    // El IV (Vector de Inicialización) añade aleatoriedad para que contraseñas iguales tengan encriptaciones distintas
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Guardamos el IV junto con la contraseña encriptada (lo necesitamos para desencriptar)
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (hash) => {
    try {
        const parts = hash.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = parts.join(':');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        // Si hay un error (ej. cambiaron la llave del .env), devolvemos un string vacío para no romper la app
        return ''; 
    }
};

module.exports = { encrypt, decrypt };