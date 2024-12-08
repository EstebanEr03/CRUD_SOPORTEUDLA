import jwt from 'jsonwebtoken';

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  console.log("Encabezados recibidos en el servidor:", req.headers); // <-- Log para depuración

  const authHeader = req.headers['authorization'] || req.headers['Authorization']; // Maneja ambas variantes

  if (!authHeader) {
    return res.status(403).json({ error: 'Token no proporcionado en el encabezado Authorization' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(400).json({ error: 'Formato de token inválido. Use "Bearer <token>"' });
  }

  const token = parts[1]; // Extraer el token después de "Bearer"
  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
    if (err) {
      console.log('Error al verificar token:', err.message);
      const errorMessage = err.name === 'TokenExpiredError'
        ? 'Token expirado'
        : 'Token inválido';
      return res.status(401).json({ error: errorMessage });
    }

    console.log('Token verificado. Datos decodificados:', decoded);
    req.user = {
      id: decoded.id,
      rol_id: decoded.rol_id,
    };
    next();
  });
};

// Middleware para verificar múltiples roles
export const verifyRole = (...roles) => (req, res, next) => {
  console.log(`Verificando roles. Requeridos: ${roles}, Usuario: ${req.user?.rol_id}`);
  if (!req.user || !roles.includes(parseInt(req.user.rol_id))) {
    return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
  }
  next();
};


export default verifyToken;
 