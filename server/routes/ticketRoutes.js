// server/routes/ticketRoutes.js
import express from 'express';
import {
  createTicket,
  getTickets,
  updateTicketStatus,
  deleteTicket,
  asignarTicket,
  getAssignedTickets,
  getMyTickets,
  getTicketById
} from '../controllers/ticketController.js';
import verifyToken, { verifyRole } from '../middleware/authMiddleware.js'; // Importa los middlewares


const router = express.Router();

router.post('/create', verifyToken, verifyRole(2), createTicket); // Crear Ticket
router.get('/all', verifyToken, verifyRole(2), getTickets); // Consultar todos los Tickets (Gestores)
router.get('/:id', verifyToken, verifyRole(2), getTicketById); // Nueva ruta para obtener un ticket por ID
router.put('/:id', verifyToken, verifyRole(2,3), updateTicketStatus); // Actualizar Ticket (Agentes)
router.put('/update/:id', verifyToken, verifyRole(2), updateTicketStatus); // Permitir actualización por Gestores
router.delete('/:id', verifyToken, verifyRole(2), deleteTicket); // Eliminar Ticket (Gestores)
router.post('/asignar', verifyToken, verifyRole(2), asignarTicket); // Asignación de Ticket
router.get('/assigned', verifyToken, verifyRole(3), getAssignedTickets); // Tickets asignados a un agente
router.get('/my-tickets', verifyToken, verifyRole(1), getMyTickets); // Tickets creados por el solicitante

export default router;
