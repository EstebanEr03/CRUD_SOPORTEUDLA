import express from 'express';
import { createTicket, getTicketsByUser, updateTicket, deleteTicket, getAllTickets } from '../controllers/ticketController.js';

const router = express.Router();

router.post('/create', createTicket);
router.get('/user/:userId', getTicketsByUser);
router.put('/update/:id', updateTicket);
router.delete('/delete/:id', deleteTicket);
router.get('/all', getAllTickets);

export default router;
