const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // Buscamos el token en los encabezados de la petición
  const authHeader = req.header('Authorization');

  // Si no hay encabezado de autorización, rechazamos la petición
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de seguridad.' });
  }

  // Extraemos el token. 
  // enviarlo como "Bearer <token>", que no se me olvide.
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido. Asegúrate de usar "Bearer <token>".' });
  }

  try {
    // Verificamos que el token sea auténtico y no haya expirado
    const secret = process.env.JWT_SECRET || 'clave_secreta_de_respaldo';
    const usuarioDecodificado = jwt.verify(token, secret);

    // Si es válido, guardamos los datos del usuario en la petición (req.user)
    req.user = usuarioDecodificado;

    // next() le da permiso a la petición para continuar hacia la ruta final
    next();
  } catch (err) {
    // Si jwt.verify falla, cae aquí
    return res.status(401).json({ error: 'Token inválido o expirado.', detalle: err.message });
  }
};

module.exports = verificarToken;