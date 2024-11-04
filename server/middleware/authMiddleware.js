import jwt from 'jsonwebtoken';

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to authenticate token' });
    }
    
    // Si el token es válido, lo decodificamos y seguimos con la petición
    req.userId = decoded.id;
    req.userRole = decoded.rol_id; // Añadimos el rol del usuario al request
    next();
  });
};

// Middleware para verificar rol
export const verifyRole = (requiredRole) => (req, res, next) => {
  if (req.userRole !== requiredRole) {
    return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
  }
  next();
};

export default verifyToken;
