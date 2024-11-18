import express from 'express';
import {
  getRoles,
  registerUser,
  loginUser,
  getEmpleados,
  updateEmpleado,
  deleteEmpleado,
} from '../controllers/userController.js';
import verifyToken, { verifyRole } from '../middleware/authMiddleware.js'; // Incluye `verifyRole`

const router = express.Router();

router.get('/roles', getRoles); // Ruta para obtener roles
router.post('/register', registerUser); // Ruta para registrar usuarios
router.post('/login', loginUser); // Ruta para iniciar sesión

// Ruta para obtener empleados (solo accesible para gestores, rol 2 en este caso)
router.get('/empleados', verifyToken, verifyRole(2), getEmpleados);

// Ruta para actualizar empleados (requiere autenticación)
router.put('/update', verifyToken, updateEmpleado);

// Ruta para eliminar empleados (requiere autenticación)
router.delete('/delete/:id', verifyToken, deleteEmpleado);

export default router;
