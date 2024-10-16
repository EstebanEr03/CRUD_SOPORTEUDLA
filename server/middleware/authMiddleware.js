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
    next();
  });
};

export default verifyToken;
