import express from 'express';
import { registerUser, loginUser, getEmpleados, updateEmpleado, deleteEmpleado } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/empleados', getEmpleados);
router.put('/update', updateEmpleado);
router.delete('/delete/:id', deleteEmpleado);

export default router;
