// server/routes/userRoutes.js
import express from 'express';
import { registerUser, loginUser, getEmpleados, updateEmpleado, deleteEmpleado, getRoles } from '../controllers/userController.js';
import verifyToken, { verifyRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/roles', getRoles);  // New endpoint to fetch roles
router.get('/empleados', verifyToken, verifyRole(2), getEmpleados); 
router.put('/update', verifyToken, updateEmpleado);
router.delete('/delete/:id', verifyToken, deleteEmpleado);

export default router;
